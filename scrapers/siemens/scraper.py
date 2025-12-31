"""
Siemens ProductCERT Security Advisory Scraper

Scrapes vulnerability data from the Siemens CERT portal and exports to JSON/Excel.
Uses Selenium for browser automation to handle JavaScript-rendered pagination.

Usage:
    python scraper.py                    # Scrape all advisories from all pages
    python scraper.py --limit 10         # Scrape only first 10 advisories
    python scraper.py --pages 3          # Scrape only first 3 pages
    python scraper.py --output ./custom  # Custom output directory
"""
import argparse
import re
import time
import sys
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse, parse_qs, urlencode

import requests
from bs4 import BeautifulSoup

# Selenium imports for browser automation
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
    from webdriver_manager.chrome import ChromeDriverManager
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("Warning: Selenium not installed. Install with: pip install selenium webdriver-manager")

from models import SiemensVulnerability, AffectedProduct
from exporters import export_to_json, export_to_excel


# Constants
BASE_URL = "https://cert-portal.siemens.com"
ADVISORIES_LIST_URL = f"{BASE_URL}/productcert/html/"
# Main Siemens CERT page (uses JavaScript for pagination)
SIEMENS_CERT_PAGE = "https://www.siemens.com/global/en/products/services/cert.html"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
REQUEST_DELAY = 0.5  # Seconds between requests to be polite
PAGE_LOAD_WAIT = 3  # Seconds to wait for page content to load
ITEMS_PER_PAGE = 15  # Based on "Showing 61-75" being page 5


def get_session() -> requests.Session:
    """Create a requests session with appropriate headers."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    })
    return session


def create_webdriver(headless: bool = True) -> Optional[webdriver.Chrome]:
    """Create a Selenium Chrome WebDriver for JavaScript-rendered pages."""
    if not SELENIUM_AVAILABLE:
        print("  ✗ Selenium not available. Please install: pip install selenium webdriver-manager")
        return None
    
    try:
        chrome_options = ChromeOptions()
        if headless:
            chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument(f"--user-agent={USER_AGENT}")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Use webdriver-manager to auto-download correct ChromeDriver
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"  ✗ Error creating WebDriver: {e}")
        return None


def scrape_page_with_selenium(driver: webdriver.Chrome) -> list[dict]:
    """
    Extract advisory data from the current page using Selenium.
    Returns list of dicts with basic info and URLs.
    """
    advisories = []
    
    try:
        # Wait for the table to be present
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        
        # Get page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Find all tables and look for the advisory table
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            
            for row in rows:
                cells = row.find_all('td')
                if len(cells) < 5:
                    continue
                
                try:
                    # First cell: SSA ID (with link)
                    id_cell = cells[0]
                    ssa_link = id_cell.find('a')
                    ssa_id = ssa_link.get_text(strip=True) if ssa_link else id_cell.get_text(strip=True)
                    
                    # Skip if not a valid SSA ID
                    if not ssa_id.startswith('SSA-'):
                        continue
                    
                    # Second cell: CVSS Score
                    cvss_text = cells[1].get_text(strip=True)
                    cvss_score = None
                    if cvss_text:
                        try:
                            cvss_score = float(cvss_text)
                        except ValueError:
                            pass
                    
                    # Third cell: Title
                    title = cells[2].get_text(strip=True)
                    
                    # Find version and date in remaining cells
                    version = ""
                    last_update = ""
                    
                    for cell in cells[3:]:
                        cell_text = cell.get_text(strip=True)
                        # Version pattern: V1.0, V1.2, etc.
                        if re.match(r'^V\d+\.?\d*$', cell_text):
                            version = cell_text
                        # Date pattern: YYYY-MM-DD
                        elif re.match(r'^\d{4}-\d{2}-\d{2}$', cell_text):
                            last_update = cell_text
                    
                    # Extract download links from last cell
                    download_cell = cells[-1]
                    links = download_cell.find_all('a')
                    
                    html_url = None
                    csaf_url = None
                    pdf_url = None
                    txt_url = None
                    
                    for link in links:
                        href = link.get('href', '')
                        link_text = link.get_text(strip=True).upper()
                        
                        if not href:
                            continue
                        
                        # Make URL absolute
                        if href.startswith('/'):
                            href = f"https://cert-portal.siemens.com{href}"
                        elif not href.startswith('http'):
                            href = f"https://cert-portal.siemens.com/productcert/{href}"
                        
                        if 'HTML' in link_text or href.endswith('.html'):
                            html_url = href
                        elif 'CSAF' in link_text or 'csaf' in href.lower():
                            csaf_url = href
                        elif 'PDF' in link_text or href.endswith('.pdf'):
                            pdf_url = href
                        elif 'TXT' in link_text or href.endswith('.txt'):
                            txt_url = href
                    
                    # Build HTML URL from SSA ID if not found
                    if not html_url:
                        html_url = f"https://cert-portal.siemens.com/productcert/html/{ssa_id.lower()}.html"
                    
                    advisories.append({
                        'ssa_id': ssa_id,
                        'title': title,
                        'cvss_score': cvss_score,
                        'version': version,
                        'last_update': last_update,
                        'html_url': html_url,
                        'csaf_url': csaf_url,
                        'pdf_url': pdf_url,
                        'txt_url': txt_url,
                    })
                    
                except Exception as e:
                    continue
    
    except Exception as e:
        print(f"  ✗ Error parsing page: {e}")
    
    return advisories


def click_next_page(driver: webdriver.Chrome) -> bool:
    """
    Click the next page button or a specific page number.
    Returns True if navigation was successful, False if no more pages.
    """
    try:
        # Wait for pagination to be present
        time.sleep(1)  # Brief wait for any animations
        
        # Try to find and click "Next" button (various patterns)
        next_selectors = [
            "//a[contains(text(), '>')]",
            "//button[contains(text(), '>')]",
            "//a[contains(@aria-label, 'next')]",
            "//button[contains(@aria-label, 'next')]",
            "//a[contains(@class, 'next')]",
            "//button[contains(@class, 'next')]",
            "//li[contains(@class, 'next')]/a",
            "//a[contains(@title, 'Next')]",
            "//*[contains(@class, 'pagination')]//a[contains(text(), '›')]",
            "//*[contains(@class, 'pagination')]//a[contains(text(), '»')]",
        ]
        
        for selector in next_selectors:
            try:
                next_btn = driver.find_element(By.XPATH, selector)
                if next_btn.is_displayed() and next_btn.is_enabled():
                    # Check if it's not disabled
                    classes = next_btn.get_attribute('class') or ''
                    if 'disabled' not in classes.lower():
                        next_btn.click()
                        time.sleep(PAGE_LOAD_WAIT)  # Wait for page to load
                        return True
            except NoSuchElementException:
                continue
        
        return False
        
    except Exception as e:
        print(f"  ✗ Error clicking next page: {e}")
        return False


def click_page_number(driver: webdriver.Chrome, page_num: int) -> bool:
    """
    Click a specific page number button.
    Returns True if navigation was successful.
    """
    try:
        time.sleep(1)
        
        # Try to find page number link
        page_selectors = [
            f"//a[text()='{page_num}']",
            f"//button[text()='{page_num}']",
            f"//a[contains(@aria-label, 'page {page_num}')]",
            f"//*[contains(@class, 'pagination')]//a[text()='{page_num}']",
            f"//*[contains(@class, 'pagination')]//button[text()='{page_num}']",
            f"//li/a[text()='{page_num}']",
        ]
        
        for selector in page_selectors:
            try:
                page_btn = driver.find_element(By.XPATH, selector)
                if page_btn.is_displayed() and page_btn.is_enabled():
                    page_btn.click()
                    time.sleep(PAGE_LOAD_WAIT)
                    return True
            except NoSuchElementException:
                continue
        
        return False
        
    except Exception as e:
        print(f"  ✗ Error clicking page {page_num}: {e}")
        return False


def get_total_pages_from_pagination(driver: webdriver.Chrome) -> int:
    """
    Try to determine total number of pages from pagination elements.
    """
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Look for page numbers
        page_numbers = set()
        
        # Find all links/buttons that look like page numbers
        for elem in soup.find_all(['a', 'button']):
            text = elem.get_text(strip=True)
            if text.isdigit():
                page_numbers.add(int(text))
        
        # Look for "Showing X - Y of Z" pattern
        page_text = soup.get_text()
        total_match = re.search(r'of\s+(\d+)', page_text)
        if total_match:
            total_items = int(total_match.group(1))
            return (total_items + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE
        
        if page_numbers:
            return max(page_numbers)
        
        return 1
        
    except Exception:
        return 1


def fetch_page(session: requests.Session, url: str) -> Optional[BeautifulSoup]:
    """Fetch a page and return BeautifulSoup object."""
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        # Use html.parser as default (works on all platforms)
        # Try lxml if available for better performance
        try:
            return BeautifulSoup(response.content, 'lxml')
        except Exception:
            return BeautifulSoup(response.content, 'html.parser')
    except requests.RequestException as e:
        print(f"  ✗ Error fetching {url}: {e}")
        return None


def detect_pagination(soup: BeautifulSoup) -> dict:
    """
    Detect pagination information from the page.
    Returns dict with: total_pages, current_page, has_next, has_prev
    """
    pagination_info = {
        'total_pages': 1,
        'current_page': 1,
        'has_next': False,
        'has_prev': False,
        'page_urls': {}
    }
    
    # Look for pagination elements
    # Pattern 1: "Showing X - Y" text indicating current range
    showing_text = soup.find(string=re.compile(r'Showing\s+\d+\s*-\s*\d+', re.IGNORECASE))
    if showing_text:
        match = re.search(r'Showing\s+(\d+)\s*-\s*(\d+)', showing_text, re.IGNORECASE)
        if match:
            start_item = int(match.group(1))
            end_item = int(match.group(2))
            # Calculate current page (assuming 15 items per page based on screenshot)
            pagination_info['current_page'] = (start_item - 1) // ITEMS_PER_PAGE + 1
    
    # Pattern 2: Look for pagination links/buttons
    # Find pagination container (common patterns)
    pagination_container = None
    for selector in ['nav[aria-label*="pagination"]', '.pagination', '[class*="pagination"]', 
                     '[class*="pager"]', 'ul.pages', '.page-numbers']:
        pagination_container = soup.select_one(selector)
        if pagination_container:
            break
    
    # Also look for numbered page links anywhere
    page_links = soup.find_all('a', href=True)
    page_numbers = set()
    
    for link in page_links:
        href = link.get('href', '')
        text = link.get_text(strip=True)
        
        # Check if link text is a number (page number)
        if text.isdigit():
            page_num = int(text)
            page_numbers.add(page_num)
            pagination_info['page_urls'][page_num] = href
        
        # Check for page parameter in URL
        if 'page=' in href or 'p=' in href or 'offset=' in href:
            parsed = urlparse(href)
            params = parse_qs(parsed.query)
            for param in ['page', 'p']:
                if param in params:
                    try:
                        page_num = int(params[param][0])
                        page_numbers.add(page_num)
                        pagination_info['page_urls'][page_num] = href
                    except (ValueError, IndexError):
                        pass
    
    # Look for "next" and "previous" buttons
    next_btn = soup.find('a', string=re.compile(r'next|›|»|>', re.IGNORECASE))
    prev_btn = soup.find('a', string=re.compile(r'prev|‹|«|<', re.IGNORECASE))
    
    if next_btn:
        pagination_info['has_next'] = True
        pagination_info['next_url'] = next_btn.get('href', '')
    
    if prev_btn:
        pagination_info['has_prev'] = True
        pagination_info['prev_url'] = prev_btn.get('href', '')
    
    # Calculate total pages from discovered page numbers
    if page_numbers:
        pagination_info['total_pages'] = max(page_numbers)
    
    # Look for total count text like "of X results" or "total: X"
    total_text = soup.find(string=re.compile(r'of\s+\d+|total[:\s]+\d+', re.IGNORECASE))
    if total_text:
        match = re.search(r'of\s+(\d+)|total[:\s]+(\d+)', total_text, re.IGNORECASE)
        if match:
            total_items = int(match.group(1) or match.group(2))
            pagination_info['total_items'] = total_items
            pagination_info['total_pages'] = (total_items + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE
    
    return pagination_info


def parse_advisory_table(soup: BeautifulSoup, base_url: str = BASE_URL) -> list[dict]:
    """
    Parse the advisory table from a page.
    Returns list of dicts with basic info and URLs.
    """
    advisories = []
    
    # Find the table containing advisories
    table = soup.find('table')
    
    if not table:
        return []
    
    rows = table.find_all('tr')[1:]  # Skip header row
    
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 6:
            continue
        
        try:
            # Extract SSA ID and link
            id_cell = cells[0]
            ssa_link = id_cell.find('a')
            ssa_id = ssa_link.get_text(strip=True) if ssa_link else id_cell.get_text(strip=True)
            
            # Skip if not a valid SSA ID
            if not ssa_id.startswith('SSA-'):
                continue
            
            # Extract CVSS score
            cvss_text = cells[1].get_text(strip=True)
            cvss_score = None
            if cvss_text:
                try:
                    cvss_score = float(cvss_text)
                except ValueError:
                    pass
            
            # Extract title
            title = cells[2].get_text(strip=True)
            
            # Extract version (column index may vary)
            version = ""
            last_update = ""
            
            # Try to find version and date columns
            for i, cell in enumerate(cells[3:], 3):
                cell_text = cell.get_text(strip=True)
                # Version pattern: V1.0, V1.2, etc.
                if re.match(r'^V\d+\.?\d*$', cell_text):
                    version = cell_text
                # Date pattern: YYYY-MM-DD
                elif re.match(r'^\d{4}-\d{2}-\d{2}$', cell_text):
                    last_update = cell_text
            
            # Extract download links (HTML, CSAF, PDF, TXT)
            download_cell = cells[-1] if len(cells) > 6 else None
            html_url = None
            csaf_url = None
            pdf_url = None
            txt_url = None
            
            if download_cell:
                links = download_cell.find_all('a')
                for link in links:
                    href = link.get('href', '')
                    link_text = link.get_text(strip=True).upper()
                    full_url = urljoin(base_url, href) if href else None
                    
                    if not full_url:
                        continue
                    
                    if 'HTML' in link_text or href.endswith('.html'):
                        html_url = full_url
                    elif 'CSAF' in link_text or 'csaf' in href.lower():
                        csaf_url = full_url
                    elif 'PDF' in link_text or href.endswith('.pdf'):
                        pdf_url = full_url
                    elif 'TXT' in link_text or href.endswith('.txt'):
                        txt_url = full_url
            
            # If no HTML URL found in download cell, try the SSA ID link
            if not html_url and ssa_link:
                href = ssa_link.get('href', '')
                if href:
                    html_url = urljoin(base_url, href)
            
            advisories.append({
                'ssa_id': ssa_id,
                'title': title,
                'cvss_score': cvss_score,
                'version': version,
                'last_update': last_update,
                'html_url': html_url,
                'csaf_url': csaf_url,
                'pdf_url': pdf_url,
                'txt_url': txt_url,
            })
            
        except Exception as e:
            print(f"  ✗ Error parsing row: {e}")
            continue
    
    return advisories


def fetch_advisory_list_with_selenium(max_pages: Optional[int] = None) -> list[dict]:
    """
    Scrape all pages of the advisory listing using Selenium for JavaScript pagination.
    Returns list of dicts with basic info and URLs from all pages.
    
    Args:
        max_pages: Maximum number of pages to fetch (None for all)
    """
    all_advisories = []
    seen_ssa_ids = set()
    
    print(f"Opening Siemens CERT page with browser automation...")
    print(f"  URL: {SIEMENS_CERT_PAGE}")
    
    # Create WebDriver
    driver = create_webdriver(headless=True)
    if not driver:
        print("  ✗ Could not create WebDriver")
        return []
    
    try:
        # Navigate to the CERT page
        driver.get(SIEMENS_CERT_PAGE)
        
        # Wait for page to fully load
        print("  Waiting for page to load...")
        time.sleep(PAGE_LOAD_WAIT + 2)  # Extra time for initial load
        
        # Try to accept any cookie consent dialogs
        try:
            cookie_selectors = [
                "//button[contains(text(), 'Accept')]",
                "//button[contains(text(), 'agree')]",
                "//button[contains(@id, 'accept')]",
                "//*[contains(@class, 'cookie')]//button",
            ]
            for selector in cookie_selectors:
                try:
                    cookie_btn = driver.find_element(By.XPATH, selector)
                    if cookie_btn.is_displayed():
                        cookie_btn.click()
                        time.sleep(1)
                        break
                except:
                    continue
        except:
            pass
        
        # Scroll down to load the advisory table
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
        time.sleep(2)
        
        # Detect total pages
        total_pages = get_total_pages_from_pagination(driver)
        print(f"  Detected approximately {total_pages} page(s)")
        
        if max_pages:
            total_pages = min(total_pages, max_pages)
            print(f"  Limiting to {total_pages} page(s)")
        
        # Scrape page 1
        print(f"  Page 1: Scraping...", end=" ")
        advisories = scrape_page_with_selenium(driver)
        for adv in advisories:
            if adv['ssa_id'] not in seen_ssa_ids:
                all_advisories.append(adv)
                seen_ssa_ids.add(adv['ssa_id'])
        print(f"Found {len(advisories)} advisories")
        
        # Scrape remaining pages
        current_page = 1
        while current_page < total_pages:
            next_page = current_page + 1
            print(f"  Page {next_page}: Navigating...", end=" ")
            
            # Try clicking the page number first
            if click_page_number(driver, next_page):
                pass
            # Otherwise try clicking next button
            elif click_next_page(driver):
                pass
            else:
                print("✗ Could not navigate to next page")
                break
            
            # Scrape the new page
            advisories = scrape_page_with_selenium(driver)
            new_count = 0
            for adv in advisories:
                if adv['ssa_id'] not in seen_ssa_ids:
                    all_advisories.append(adv)
                    seen_ssa_ids.add(adv['ssa_id'])
                    new_count += 1
            
            print(f"Found {new_count} new advisories")
            current_page = next_page
            
            # Brief delay between pages
            time.sleep(REQUEST_DELAY)
        
        print(f"  ✓ Total: {len(all_advisories)} unique advisories from {current_page} page(s)")
        
    except Exception as e:
        print(f"  ✗ Error during scraping: {e}")
    
    finally:
        driver.quit()
    
    return all_advisories


def fetch_advisory_list(session: requests.Session, max_pages: Optional[int] = None) -> list[dict]:
    """
    Scrape all pages of the advisory listing.
    Uses Selenium for JavaScript-rendered pages, falls back to requests if not available.
    
    Args:
        session: requests Session object
        max_pages: Maximum number of pages to fetch (None for all)
    """
    # Use Selenium for the Siemens CERT page (JavaScript pagination)
    if SELENIUM_AVAILABLE:
        return fetch_advisory_list_with_selenium(max_pages)
    
    # Fallback to basic requests (limited - only first page)
    print("  ⚠ Selenium not available, using basic scraping (first page only)")
    print(f"  Install Selenium for full pagination: pip install selenium webdriver-manager")
    
    all_advisories = []
    seen_ssa_ids = set()
    
    print(f"Fetching advisory list from {SIEMENS_CERT_PAGE}")
    
    soup = fetch_page(session, SIEMENS_CERT_PAGE)
    
    if not soup:
        print("  ✗ Could not fetch page")
        return []
    
    advisories = parse_advisory_table(soup, SIEMENS_CERT_PAGE)
    for adv in advisories:
        if adv['ssa_id'] not in seen_ssa_ids:
            all_advisories.append(adv)
            seen_ssa_ids.add(adv['ssa_id'])
    
    print(f"  ✓ Found {len(all_advisories)} advisories (first page only)")
    return all_advisories


def parse_cvss_scores(soup: BeautifulSoup) -> tuple[Optional[float], Optional[float]]:
    """Extract CVSS v3.1 and v4.0 scores from detail page."""
    cvss_v3 = None
    cvss_v4 = None
    
    # Look for CVSS scores in the page text
    page_text = soup.get_text()
    
    # Pattern for CVSS v3.1
    v3_match = re.search(r'CVSS\s*v3\.1\s*Base\s*Score[:\s]*(\d+\.?\d*)', page_text, re.IGNORECASE)
    if v3_match:
        try:
            cvss_v3 = float(v3_match.group(1))
        except ValueError:
            pass
    
    # Pattern for CVSS v4.0
    v4_match = re.search(r'CVSS\s*v4\.0\s*Base\s*Score[:\s]*(\d+\.?\d*)', page_text, re.IGNORECASE)
    if v4_match:
        try:
            cvss_v4 = float(v4_match.group(1))
        except ValueError:
            pass
    
    return cvss_v3, cvss_v4


def parse_cve_ids(soup: BeautifulSoup) -> list[str]:
    """Extract all CVE identifiers from the page."""
    cve_ids = set()
    page_text = soup.get_text()
    
    # Find all CVE patterns
    cve_pattern = re.compile(r'CVE-\d{4}-\d{4,}', re.IGNORECASE)
    matches = cve_pattern.findall(page_text)
    
    for match in matches:
        cve_ids.add(match.upper())
    
    return sorted(list(cve_ids))


def parse_dates(soup: BeautifulSoup) -> tuple[str, str]:
    """Extract publication and last update dates."""
    publication_date = ""
    last_update = ""
    
    page_text = soup.get_text()
    
    # Publication date
    pub_match = re.search(r'Publication\s*Date[:\s]*(\d{4}-\d{2}-\d{2})', page_text, re.IGNORECASE)
    if pub_match:
        publication_date = pub_match.group(1)
    
    # Last update
    update_match = re.search(r'Last\s*Update[:\s]*(\d{4}-\d{2}-\d{2})', page_text, re.IGNORECASE)
    if update_match:
        last_update = update_match.group(1)
    
    return publication_date, last_update


def parse_summary(soup: BeautifulSoup) -> str:
    """Extract the summary section."""
    summary = ""
    
    # Look for SUMMARY section
    summary_header = soup.find(string=re.compile(r'SUMMARY', re.IGNORECASE))
    if summary_header:
        parent = summary_header.find_parent()
        if parent:
            # Get the next sibling elements until we hit another section
            next_elem = parent.find_next_sibling()
            while next_elem:
                text = next_elem.get_text(strip=True)
                if text and not re.match(r'^(KNOWN AFFECTED|MITIGATIONS|GENERAL SECURITY|ADDITIONAL)', text, re.IGNORECASE):
                    summary += text + " "
                else:
                    break
                next_elem = next_elem.find_next_sibling()
    
    # Fallback: look for paragraphs after summary
    if not summary:
        for p in soup.find_all('p'):
            text = p.get_text(strip=True)
            if 'affected by' in text.lower() or 'vulnerability' in text.lower():
                summary = text
                break
    
    return summary.strip()


def parse_affected_products(soup: BeautifulSoup) -> list[AffectedProduct]:
    """Extract affected products table."""
    products = []
    
    # Look for the affected products table
    # Usually has headers like "Affected Product and Versions" and "Remediation"
    tables = soup.find_all('table')
    
    for table in tables:
        headers = [th.get_text(strip=True).lower() for th in table.find_all('th')]
        
        # Check if this looks like an affected products table
        if any('affected' in h or 'product' in h for h in headers) or any('remediation' in h for h in headers):
            rows = table.find_all('tr')[1:]  # Skip header
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    # First cell usually has product and versions
                    product_cell = cells[0]
                    product_text = product_cell.get_text(separator='\n', strip=True)
                    
                    # Split product name and versions
                    lines = product_text.split('\n')
                    product_name = lines[0] if lines else ""
                    versions = lines[1] if len(lines) > 1 else ""
                    
                    # Check for CVE in the product cell
                    cve_match = re.search(r'CVE-\d{4}-\d+', product_text)
                    cve_id = cve_match.group(0) if cve_match else None
                    
                    # Second cell has remediation
                    remediation = cells[1].get_text(separator=' ', strip=True) if len(cells) > 1 else ""
                    
                    if product_name:
                        products.append(AffectedProduct(
                            product=product_name,
                            versions=versions,
                            remediation=remediation,
                            cve_id=cve_id
                        ))
    
    return products


def parse_mitigations(soup: BeautifulSoup) -> list[str]:
    """Extract mitigations section."""
    mitigations = []
    
    # Find MITIGATIONS section
    mitigation_header = soup.find(string=re.compile(r'^MITIGATIONS$', re.IGNORECASE))
    if mitigation_header:
        parent = mitigation_header.find_parent()
        if parent:
            # Look for list items or paragraphs
            container = parent.find_next_sibling()
            while container:
                if container.name == 'ul' or container.name == 'ol':
                    for li in container.find_all('li'):
                        text = li.get_text(strip=True)
                        if text:
                            mitigations.append(text)
                    break
                elif container.name == 'p':
                    text = container.get_text(strip=True)
                    if text and not re.match(r'^(GENERAL SECURITY|ADDITIONAL)', text, re.IGNORECASE):
                        mitigations.append(text)
                    else:
                        break
                container = container.find_next_sibling()
    
    return mitigations


def parse_general_recommendations(soup: BeautifulSoup) -> list[str]:
    """Extract general security recommendations."""
    recommendations = []
    
    # Find GENERAL SECURITY RECOMMENDATIONS section
    rec_header = soup.find(string=re.compile(r'GENERAL SECURITY RECOMMENDATIONS', re.IGNORECASE))
    if rec_header:
        parent = rec_header.find_parent()
        if parent:
            container = parent.find_next_sibling()
            while container:
                if container.name == 'ul' or container.name == 'ol':
                    for li in container.find_all('li'):
                        text = li.get_text(strip=True)
                        if text:
                            recommendations.append(text)
                elif container.name == 'p':
                    text = container.get_text(strip=True)
                    if text and not re.match(r'^(ADDITIONAL|HISTORY)', text, re.IGNORECASE):
                        recommendations.append(text)
                    elif re.match(r'^(ADDITIONAL|HISTORY)', text, re.IGNORECASE):
                        break
                container = container.find_next_sibling()
    
    return recommendations


def fetch_advisory_detail(session: requests.Session, url: str, basic_info: dict) -> Optional[SiemensVulnerability]:
    """
    Fetch and parse a single advisory detail page.
    """
    soup = fetch_page(session, url)
    
    if not soup:
        # Return basic info if we can't fetch details
        return SiemensVulnerability(
            ssa_id=basic_info['ssa_id'],
            title=basic_info['title'],
            cvss_v3_score=basic_info.get('cvss_score'),
            last_update=basic_info.get('last_update', ''),
            version=basic_info.get('version', ''),
            html_url=url,
            csaf_url=basic_info.get('csaf_url'),
            pdf_url=basic_info.get('pdf_url'),
            txt_url=basic_info.get('txt_url'),
        )
    
    # Parse all details
    cvss_v3, cvss_v4 = parse_cvss_scores(soup)
    cve_ids = parse_cve_ids(soup)
    publication_date, last_update = parse_dates(soup)
    summary = parse_summary(soup)
    affected_products = parse_affected_products(soup)
    mitigations = parse_mitigations(soup)
    recommendations = parse_general_recommendations(soup)
    
    # Use scraped CVSS if available, otherwise use from list
    if cvss_v3 is None:
        cvss_v3 = basic_info.get('cvss_score')
    
    return SiemensVulnerability(
        ssa_id=basic_info['ssa_id'],
        title=basic_info['title'],
        cvss_v3_score=cvss_v3,
        cvss_v4_score=cvss_v4,
        cve_ids=cve_ids,
        publication_date=publication_date,
        last_update=last_update or basic_info.get('last_update', ''),
        version=basic_info.get('version', ''),
        summary=summary,
        affected_products=affected_products,
        mitigations=mitigations,
        general_recommendations=recommendations,
        html_url=url,
        csaf_url=basic_info.get('csaf_url'),
        pdf_url=basic_info.get('pdf_url'),
        txt_url=basic_info.get('txt_url'),
    )


def scrape_all_advisories(
    limit: Optional[int] = None, 
    max_pages: Optional[int] = None,
    skip_details: bool = False
) -> list[SiemensVulnerability]:
    """
    Main scraping function.
    
    Args:
        limit: Maximum number of advisories to scrape (None for all)
        max_pages: Maximum number of pages to fetch (None for all)
        skip_details: If True, only scrape the list page (faster but less data)
    
    Returns:
        List of SiemensVulnerability objects
    """
    session = get_session()
    vulnerabilities = []
    
    # Step 1: Get list of all advisories from all pages
    advisory_list = fetch_advisory_list(session, max_pages=max_pages)
    
    if not advisory_list:
        print("No advisories found. The website structure may have changed.")
        return []
    
    # Apply limit on total advisories
    if limit:
        advisory_list = advisory_list[:limit]
        print(f"Limiting to {limit} advisories")
    
    # Step 2: Fetch details for each advisory
    total = len(advisory_list)
    
    for i, basic_info in enumerate(advisory_list, 1):
        ssa_id = basic_info['ssa_id']
        html_url = basic_info.get('html_url')
        
        print(f"[{i}/{total}] Fetching {ssa_id}...", end=" ")
        
        if skip_details or not html_url:
            # Create vulnerability with basic info only
            vuln = SiemensVulnerability(
                ssa_id=ssa_id,
                title=basic_info['title'],
                cvss_v3_score=basic_info.get('cvss_score'),
                last_update=basic_info.get('last_update', ''),
                version=basic_info.get('version', ''),
                html_url=html_url or '',
                csaf_url=basic_info.get('csaf_url'),
                pdf_url=basic_info.get('pdf_url'),
                txt_url=basic_info.get('txt_url'),
            )
            print("(basic info only)")
        else:
            vuln = fetch_advisory_detail(session, html_url, basic_info)
            if vuln:
                cve_count = len(vuln.cve_ids)
                product_count = len(vuln.affected_products)
                print(f"✓ ({cve_count} CVEs, {product_count} products)")
            else:
                print("✗ Failed")
                continue
        
        vulnerabilities.append(vuln)
        
        # Be polite with request rate
        if not skip_details:
            time.sleep(REQUEST_DELAY)
    
    return vulnerabilities


def main():
    """Main entry point with CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Scrape Siemens ProductCERT security advisories"
    )
    parser.add_argument(
        '--limit', '-l',
        type=int,
        default=None,
        help='Maximum number of advisories to scrape (default: all)'
    )
    parser.add_argument(
        '--pages', '-p',
        type=int,
        default=None,
        help='Maximum number of pages to fetch (default: all). Each page has ~15 advisories.'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='./output',
        help='Output directory for generated files (default: ./output)'
    )
    parser.add_argument(
        '--skip-details', '-s',
        action='store_true',
        help='Skip fetching detail pages (faster but less data)'
    )
    parser.add_argument(
        '--json-only',
        action='store_true',
        help='Only export JSON (skip Excel)'
    )
    parser.add_argument(
        '--excel-only',
        action='store_true',
        help='Only export Excel (skip JSON)'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Siemens ProductCERT Security Advisory Scraper")
    print("=" * 60)
    print()
    
    if args.pages:
        print(f"Will fetch up to {args.pages} page(s) (~{args.pages * ITEMS_PER_PAGE} advisories)")
    print()
    
    # Run scraper
    vulnerabilities = scrape_all_advisories(
        limit=args.limit,
        max_pages=args.pages,
        skip_details=args.skip_details
    )
    
    if not vulnerabilities:
        print("\nNo vulnerabilities scraped. Exiting.")
        sys.exit(1)
    
    print()
    print(f"Successfully scraped {len(vulnerabilities)} advisories")
    print()
    
    # Export results
    output_dir = Path(args.output)
    
    if not args.excel_only:
        json_path = output_dir / "siemens_vulnerabilities.json"
        export_to_json(vulnerabilities, str(json_path))
    
    if not args.json_only:
        excel_path = output_dir / "siemens_vulnerabilities.xlsx"
        export_to_excel(vulnerabilities, str(excel_path))
    
    print()
    print("Done!")


if __name__ == "__main__":
    main()

