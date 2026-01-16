"""
Hitachi Software Vulnerability Information Scraper

Scrapes vulnerability data from the Hitachi security portal and exports to JSON/Excel.
Uses requests and BeautifulSoup for HTML parsing.

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

from models import HitachiVulnerability, AffectedProduct
from exporters import export_to_json, export_to_excel


# Constants
BASE_URL = "https://www.hitachi.com"
VULN_LIST_URL = f"{BASE_URL}/products/it/software/security/index.html"
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
        try:
            return BeautifulSoup(response.content, 'lxml')
        except Exception:
            return BeautifulSoup(response.content, 'html.parser')
    except requests.RequestException as e:
        print(f"  [ERROR] Error fetching {url}: {e}")
        return None


def extract_advisory_links(soup: BeautifulSoup) -> list[dict]:
    """
    Extract advisory information from the main vulnerability list page.
    Returns list of dicts with advisory_id, title, last_update, cve_ids, and url.
    """
    advisories = []
    
    # Find all list items that contain advisory info
    # Pattern: hitachi-sec-YYYY-NNN
    advisory_pattern = re.compile(r'hitachi-sec-\d{4}-\d+', re.IGNORECASE)
    
    # Get all text content to find advisories
    page_text = str(soup)
    
    # Find advisory blocks - they appear in grouped sections
    # Look for elements containing "hitachi-sec" followed by vulnerability description
    
    # Find all links that lead to advisory detail pages
    links = soup.find_all('a', href=True)
    
    seen_ids = set()
    
    for link in links:
        href = link.get('href', '')
        text = link.get_text(strip=True)
        
        # Check if this looks like an advisory link
        if 'hitachi-sec' in href.lower() or 'hitachi-sec' in text.lower():
            # Extract advisory ID from URL or text
            id_match = advisory_pattern.search(href) or advisory_pattern.search(text)
            if id_match:
                advisory_id = id_match.group(0).lower()
                
                if advisory_id in seen_ids:
                    continue
                seen_ids.add(advisory_id)
                
                # Build full URL
                if href.startswith('/'):
                    full_url = urljoin(BASE_URL, href)
                elif href.startswith('http'):
                    full_url = href
                else:
                    # Assume it's relative to the security info directory
                    full_url = f"{BASE_URL}/products/it/software/security/info/vuls/{advisory_id}/index.html"
                
                # Try to get the title from the link or nearby element
                title = text if text and 'hitachi-sec' not in text.lower() else ""
                
                advisories.append({
                    'advisory_id': advisory_id,
                    'title': title,
                    'url': full_url,
                    'last_update': '',
                    'cve_ids': []
                })
    
    # Also scan for CVE references and dates in the page to enrich our data
    # Look for patterns like "hitachi-sec-2025-133 Last Update: December 23, 2025"
    text = soup.get_text()
    
    # Find date patterns near advisory IDs
    date_pattern = re.compile(
        r'(hitachi-sec-\d{4}-\d+).*?(?:Last\s*Update|Updated?)[:.]?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})',
        re.IGNORECASE | re.DOTALL
    )
    
    for match in date_pattern.finditer(text):
        adv_id = match.group(1).lower()
        date_str = match.group(2)
        
        # Update the advisory with the date
        for adv in advisories:
            if adv['advisory_id'] == adv_id and not adv['last_update']:
                adv['last_update'] = date_str
                break
    
    # Find CVE patterns
    cve_pattern = re.compile(r'CVE-\d{4}-\d+', re.IGNORECASE)
    
    # For each advisory block, try to find associated CVEs
    # Look at the structure: advisory ID is followed by description and CVE list
    for adv in advisories:
        # Find the position of this advisory in the text
        pos = text.lower().find(adv['advisory_id'])
        if pos >= 0:
            # Look at the next 2000 characters for CVEs
            block = text[pos:pos + 2000]
            # Stop at the next advisory ID if found
            next_adv = advisory_pattern.search(block[20:])  # Skip the current ID
            if next_adv:
                block = block[:20 + next_adv.start()]
            
            cves = cve_pattern.findall(block)
            adv['cve_ids'] = list(set(cve.upper() for cve in cves))
    
    return advisories


def parse_cvss_from_text(text: str) -> dict[str, float]:
    """Extract CVSS scores from text, returning CVE -> score mapping."""
    cvss_scores = {}
    
    # Pattern: CVE-YYYY-NNNNN ... CVSS SCORE: X.X
    # Hitachi format: "CVE-2025-66444: Cross-Site Scripting vulnerability... CVSS SCORE: 8.2(High)"
    patterns = [
        # "CVE-2025-66444: ... CVSS SCORE: 8.2(High)" - Hitachi format
        re.compile(r'(CVE-\d{4}-\d+)[^C]*?CVSS\s*SCORE[:\s]*(\d+\.?\d*)', re.IGNORECASE),
        # "CVE-2025-66444 ... CVSS:3.1/... Score: 8.2"
        re.compile(r'(CVE-\d{4}-\d+)[^C]*?(?:Base\s*)?Score[:\s]*(\d+\.?\d*)', re.IGNORECASE),
        # Generic CVSS pattern
        re.compile(r'(CVE-\d{4}-\d+)[^C]*?(\d+\.\d)\s*\((?:Critical|High|Medium|Low)\)', re.IGNORECASE),
    ]
    
    for pattern in patterns:
        for match in pattern.finditer(text):
            cve_id = match.group(1).upper()
            if cve_id in cvss_scores:
                continue  # Don't overwrite existing score
            try:
                score = float(match.group(2))
                if 0 <= score <= 10:  # Valid CVSS range
                    cvss_scores[cve_id] = score
            except ValueError:
                continue
    
    return cvss_scores


def parse_cve_descriptions(soup: BeautifulSoup) -> dict[str, str]:
    """Extract CVE descriptions from the page."""
    descriptions = {}
    text = soup.get_text()
    
    # Pattern for CVE descriptions like:
    # "CVE-2025-66444: Cross-Site Scripting vulnerability in Hitachi..."
    # Stop at CVSS SCORE or next CVE
    cve_pattern = re.compile(
        r'(CVE-\d{4}-\d+)[:\s]+([^C]+?)(?=CVSS|CVE-\d{4}-\d+|$|Affected\s+product)',
        re.IGNORECASE | re.DOTALL
    )
    
    for match in cve_pattern.finditer(text):
        cve_id = match.group(1).upper()
        desc = match.group(2).strip()
        # Clean up the description
        desc = re.sub(r'\s+', ' ', desc)
        desc = desc.strip('.,: ')
        # Remove trailing parentheses content like "(Display new window)"
        desc = re.sub(r'\s*\([^)]*window[^)]*\)\s*$', '', desc, flags=re.IGNORECASE)
        if len(desc) > 10:  # Only keep meaningful descriptions
            descriptions[cve_id] = desc[:500]  # Limit length
    
    return descriptions


def parse_affected_products(soup: BeautifulSoup) -> list[AffectedProduct]:
    """Extract affected products from the detail page."""
    products = []
    
    # Look for the affected products section
    # Usually in a table or list format
    text = soup.get_text()
    
    # Find tables in the page
    tables = soup.find_all('table')
    
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                cell_texts = [cell.get_text(strip=True) for cell in cells]
                
                # Skip header rows
                if any('product' in t.lower() or 'version' in t.lower() for t in cell_texts):
                    continue
                
                # Try to identify product name and version
                product_name = cell_texts[0] if cell_texts else ""
                versions = cell_texts[1] if len(cell_texts) > 1 else ""
                fixed = cell_texts[2] if len(cell_texts) > 2 else ""
                
                if product_name and not product_name.isdigit():
                    products.append(AffectedProduct(
                        product=product_name,
                        versions=versions,
                        fixed_version=fixed
                    ))
    
    # Also look for list-based product information
    # Pattern: "Product Name: version X.X - X.X"
    product_pattern = re.compile(
        r'(Hitachi\s+[\w\s]+(?:Advisor|Analyzer|Suite|Manager|Director|Center|Server|Base)[\w\s]*?)(?:\s*[:]\s*|\s+(?:version|ver\.?|v\.?)\s*)([^\n]+)',
        re.IGNORECASE
    )
    
    for match in product_pattern.finditer(text):
        product_name = match.group(1).strip()
        versions = match.group(2).strip()
        
        # Check if we already have this product
        exists = any(p.product.lower() == product_name.lower() for p in products)
        if not exists and product_name:
            products.append(AffectedProduct(
                product=product_name,
                versions=versions
            ))
    
    return products


def fetch_advisory_detail(session: requests.Session, advisory: dict) -> Optional[HitachiVulnerability]:
    """
    Fetch and parse a single advisory detail page.
    """
    url = advisory['url']
    soup = fetch_page(session, url)
    
    if not soup:
        # Return basic info if we can't fetch details
        return HitachiVulnerability(
            advisory_id=advisory['advisory_id'],
            title=advisory.get('title', ''),
            cve_ids=advisory.get('cve_ids', []),
            last_update=advisory.get('last_update', ''),
            html_url=url
        )
    
    # Get the page text for various extractions
    text = soup.get_text()
    
    # Extract title from page
    title = advisory.get('title', '')
    if not title:
        title_elem = soup.find('h1') or soup.find('h2')
        if title_elem:
            title = title_elem.get_text(strip=True)
    
    # Extract CVE IDs
    cve_pattern = re.compile(r'CVE-\d{4}-\d+', re.IGNORECASE)
    cve_ids = list(set(cve.upper() for cve in cve_pattern.findall(text)))
    
    # If we didn't find any CVEs, use the ones from the list page
    if not cve_ids:
        cve_ids = advisory.get('cve_ids', [])
    
    # Extract CVSS scores
    cvss_scores = parse_cvss_from_text(text)
    
    # Extract description
    description = ""
    desc_section = soup.find(string=re.compile(r'Vulnerability\s+description', re.IGNORECASE))
    if desc_section:
        parent = desc_section.find_parent()
        if parent:
            # Get the next sibling elements
            next_elem = parent.find_next_sibling()
            while next_elem and next_elem.name not in ['h1', 'h2', 'h3']:
                desc_text = next_elem.get_text(strip=True)
                if desc_text:
                    description += desc_text + " "
                next_elem = next_elem.find_next_sibling()
                if description and len(description) > 100:
                    break
    
    # Fallback: look for CVE descriptions
    if not description:
        cve_descs = parse_cve_descriptions(soup)
        if cve_descs:
            description = "; ".join(f"{cve}: {desc}" for cve, desc in cve_descs.items())
    
    # Extract dates
    publication_date = ""
    last_update = advisory.get('last_update', '')
    
    # Look for dates in the page
    date_patterns = [
        (r'(?:Release|Publication)\s*(?:Date)?[:\s]*(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})', 'publication'),
        (r'(?:Last\s*)?Update[d]?\s*(?:Date)?[:\s]*(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})', 'last_update'),
    ]
    
    for pattern, date_type in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            if date_type == 'publication' and not publication_date:
                publication_date = date_str
            elif date_type == 'last_update' and not last_update:
                last_update = date_str
    
    # Extract affected products
    affected_products = parse_affected_products(soup)
    
    # Extract fixed products info
    fixed_products = []
    fixed_section = soup.find(string=re.compile(r'Fixed\s+product', re.IGNORECASE))
    if fixed_section:
        parent = fixed_section.find_parent()
        if parent:
            # Look for product names in the next elements
            next_elem = parent.find_next(['ul', 'ol', 'table', 'p', 'div'])
            if next_elem:
                items = next_elem.find_all('li') if next_elem.name in ['ul', 'ol'] else [next_elem]
                for item in items[:10]:  # Limit to prevent too many
                    item_text = item.get_text(strip=True)
                    if item_text and 'Hitachi' in item_text:
                        fixed_products.append(item_text)
    
    return HitachiVulnerability(
        advisory_id=advisory['advisory_id'],
        title=title,
        cve_ids=sorted(cve_ids),
        cvss_scores=cvss_scores,
        description=description.strip(),
        publication_date=publication_date,
        last_update=last_update,
        affected_products=affected_products,
        fixed_products=fixed_products,
        html_url=url
    )


def scrape_all_advisories(
    limit: Optional[int] = None,
    skip_details: bool = False,
    years: Optional[list[int]] = None
) -> list[HitachiVulnerability]:
    """
    Main scraping function.
    
    Args:
        limit: Maximum number of advisories to scrape (None for all)
        skip_details: If True, only scrape the list page (faster but less data)
        years: List of years to scrape (e.g., [2024, 2025]). None for all available.
    
    Returns:
        List of HitachiVulnerability objects
    """
    session = get_session()
    vulnerabilities = []
    
    print(f"Fetching advisory list from {VULN_LIST_URL}")
    
    # Fetch the main vulnerability list page
    soup = fetch_page(session, VULN_LIST_URL)
    
    if not soup:
        print("  [ERROR] Could not fetch vulnerability list page")
        return []
    
    # Extract advisory information from the page
    advisory_list = extract_advisory_links(soup)
    
    if not advisory_list:
        print("  [ERROR] No advisories found. The website structure may have changed.")
        return []
    
    print(f"  [OK] Found {len(advisory_list)} advisories")
    
    # Filter by year if specified
    if years:
        advisory_list = [
            adv for adv in advisory_list
            if any(str(year) in adv['advisory_id'] for year in years)
        ]
        print(f"  [OK] Filtered to {len(advisory_list)} advisories for years: {years}")
    
    # Apply limit
    if limit:
        advisory_list = advisory_list[:limit]
        print(f"  [OK] Limiting to {limit} advisories")
    
    # Fetch details for each advisory
    total = len(advisory_list)
    
    for i, advisory in enumerate(advisory_list, 1):
        advisory_id = advisory['advisory_id']
        
        print(f"[{i}/{total}] Fetching {advisory_id}...", end=" ")
        
        if skip_details:
            # Create vulnerability with basic info only
            vuln = HitachiVulnerability(
                advisory_id=advisory_id,
                title=advisory.get('title', ''),
                cve_ids=advisory.get('cve_ids', []),
                last_update=advisory.get('last_update', ''),
                html_url=advisory['url']
            )
            print("(basic info only)")
        else:
            vuln = fetch_advisory_detail(session, advisory)
            if vuln:
                cve_count = len(vuln.cve_ids)
                product_count = len(vuln.affected_products)
                print(f"OK ({cve_count} CVEs, {product_count} products)")
            else:
                print("FAILED")
                continue
        
        vulnerabilities.append(vuln)
        
        # Be polite with request rate
        if not skip_details:
            time.sleep(REQUEST_DELAY)
    
    return vulnerabilities


def main():
    """Main entry point with CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Scrape Hitachi Software Vulnerability Information"
    )
    parser.add_argument(
        '--limit', '-l',
        type=int,
        default=None,
        help='Maximum number of advisories to scrape (default: all)'
    )
    parser.add_argument(
        '--years', '-y',
        type=int,
        nargs='+',
        default=None,
        help='Filter to specific years (e.g., --years 2024 2025)'
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
    print("Hitachi Software Vulnerability Information Scraper")
    print("=" * 60)
    print()
    
    if args.years:
        print(f"Filtering to years: {args.years}")
    print()
    
    # Run scraper
    vulnerabilities = scrape_all_advisories(
        limit=args.limit,
        skip_details=args.skip_details,
        years=args.years
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
        json_path = output_dir / "hitachi_vulnerabilities.json"
        export_to_json(vulnerabilities, str(json_path))
    
    if not args.json_only:
        excel_path = output_dir / "hitachi_vulnerabilities.xlsx"
        export_to_excel(vulnerabilities, str(excel_path))
    
    print()
    print("Done!")


if __name__ == "__main__":
    main()
