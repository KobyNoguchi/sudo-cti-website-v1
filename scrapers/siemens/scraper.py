"""
Siemens ProductCERT Security Advisory Scraper

Scrapes vulnerability data from the Siemens CERT portal and exports to JSON/Excel.

Usage:
    python scraper.py                    # Scrape all advisories
    python scraper.py --limit 10         # Scrape only first 10 advisories
    python scraper.py --output ./custom  # Custom output directory
"""
import argparse
import re
import time
import sys
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from models import SiemensVulnerability, AffectedProduct
from exporters import export_to_json, export_to_excel


# Constants
BASE_URL = "https://cert-portal.siemens.com"
ADVISORIES_LIST_URL = f"{BASE_URL}/productcert/html/"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
REQUEST_DELAY = 0.5  # Seconds between requests to be polite


def get_session() -> requests.Session:
    """Create a requests session with appropriate headers."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    })
    return session


def fetch_page(session: requests.Session, url: str) -> Optional[BeautifulSoup]:
    """Fetch a page and return BeautifulSoup object."""
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'lxml')
    except requests.RequestException as e:
        print(f"  ✗ Error fetching {url}: {e}")
        return None


def fetch_advisory_list(session: requests.Session) -> list[dict]:
    """
    Scrape the main advisory listing page.
    Returns list of dicts with basic info and URLs.
    """
    print(f"Fetching advisory list from {ADVISORIES_LIST_URL}")
    soup = fetch_page(session, ADVISORIES_LIST_URL)
    
    if not soup:
        return []
    
    advisories = []
    
    # Find the table containing advisories
    # The table has columns: ID, CVSS Score, Document Title, Info, Version, Last Update, Download
    table = soup.find('table')
    
    if not table:
        print("  ✗ Could not find advisory table on page")
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
            
            # Extract version
            version = cells[4].get_text(strip=True)
            
            # Extract last update date
            last_update = cells[5].get_text(strip=True)
            
            # Extract download links (HTML, CSAF, PDF, TXT)
            download_cell = cells[6] if len(cells) > 6 else None
            html_url = None
            csaf_url = None
            pdf_url = None
            txt_url = None
            
            if download_cell:
                links = download_cell.find_all('a')
                for link in links:
                    href = link.get('href', '')
                    link_text = link.get_text(strip=True).upper()
                    full_url = urljoin(BASE_URL, href)
                    
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
                html_url = urljoin(BASE_URL, ssa_link.get('href', ''))
            
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
    
    print(f"  ✓ Found {len(advisories)} advisories")
    return advisories


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


def scrape_all_advisories(limit: Optional[int] = None, skip_details: bool = False) -> list[SiemensVulnerability]:
    """
    Main scraping function.
    
    Args:
        limit: Maximum number of advisories to scrape (None for all)
        skip_details: If True, only scrape the list page (faster but less data)
    
    Returns:
        List of SiemensVulnerability objects
    """
    session = get_session()
    vulnerabilities = []
    
    # Step 1: Get list of all advisories
    advisory_list = fetch_advisory_list(session)
    
    if not advisory_list:
        print("No advisories found. The website structure may have changed.")
        return []
    
    # Apply limit
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
    
    # Run scraper
    vulnerabilities = scrape_all_advisories(
        limit=args.limit,
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

