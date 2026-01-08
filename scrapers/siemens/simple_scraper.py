"""
Simple Siemens CERT Scraper - Fetches CSAF JSON files directly.

Features:
- Fetches vulnerability data from Siemens ProductCERT CSAF JSON files
- Comprehensive logging to both console and file
- Tracks success/failure rates and timing
- Exports to JSON format for website consumption

Usage:
    python simple_scraper.py
    python simple_scraper.py --quiet  # Minimal console output
"""
import argparse
import logging
import requests
import json
import time
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ============================================================================
# Configuration
# ============================================================================

# Known SSA IDs from Siemens CERT
# These can be found on https://www.siemens.com/global/en/products/services/cert.html
SSA_IDS = [
    # Page 1 (most recent - December 2025)
    "SSA-512988", "SSA-915282", "SSA-912274", "SSA-882673", "SSA-868571",
    "SSA-800126", "SSA-763474", "SSA-734261", "SSA-723487", "SSA-710408",
    "SSA-693808", "SSA-673996", "SSA-654321", "SSA-640476", "SSA-626856",
    "SSA-563922", "SSA-534283", "SSA-503939", "SSA-494539", "SSA-493396",
    "SSA-471761", "SSA-420375", "SSA-416652", "SSA-408105", "SSA-392859",
    "SSA-356310", "SSA-282044", "SSA-212953", "SSA-202008",
    # Page 2
    "SSA-481506", "SSA-446545", "SSA-434032", "SSA-432758", "SSA-398330",
    "SSA-392912", "SSA-364175", "SSA-357412", "SSA-337522", "SSA-321292",
    "SSA-319319", "SSA-312271", "SSA-294223", "SSA-280834", "SSA-265688",
    # Page 3
    "SSA-264815", "SSA-258494", "SSA-247486", "SSA-243317", "SSA-240541",
    "SSA-224824", "SSA-216014", "SSA-196737", "SSA-187636", "SSA-180704",
    "SSA-179006", "SSA-173615", "SSA-168272", "SSA-161653", "SSA-148078",
    # Page 4
    "SSA-145805", "SSA-130290", "SSA-128140", "SSA-118850", "SSA-111547",
    "SSA-103653", "SSA-097435", "SSA-093430", "SSA-087301", "SSA-077170",
    "SSA-071402", "SSA-068047", "SSA-064222", "SSA-063049", "SSA-054046",
    # Page 5
    "SSA-053113", "SSA-047424", "SSA-044340", "SSA-039007", "SSA-035466",
    "SSA-032915", "SSA-025073", "SSA-017796", "SSA-016548", "SSA-015814",
    "SSA-013547", "SSA-009810", "SSA-007430", "SSA-006673", "SSA-004426",
]

CSAF_BASE_URL = "https://cert-portal.siemens.com/productcert/csaf"
REQUEST_TIMEOUT = 15
REQUEST_DELAY = 0.3  # Seconds between requests to be polite

# ============================================================================
# Logging Setup
# ============================================================================

def setup_logging(log_dir: Path, quiet: bool = False) -> logging.Logger:
    """
    Configure logging to both console and file.
    
    Args:
        log_dir: Directory to store log files
        quiet: If True, only show warnings and errors on console
    
    Returns:
        Configured logger instance
    """
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Create logger
    logger = logging.getLogger("siemens_scraper")
    logger.setLevel(logging.DEBUG)
    
    # Clear any existing handlers
    logger.handlers = []
    
    # File handler - detailed logging with timestamps
    log_filename = f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    file_handler = logging.FileHandler(log_dir / log_filename, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Console handler - concise output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.WARNING if quiet else logging.INFO)
    console_formatter = logging.Formatter('%(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # Also create/update a 'latest.log' symlink/copy for easy access
    latest_log = log_dir / "latest.log"
    try:
        if latest_log.exists():
            latest_log.unlink()
        # On Windows, just copy the reference
        with open(latest_log, 'w', encoding='utf-8') as f:
            f.write(f"# Latest scraper log: {log_filename}\n")
            f.write(f"# Started: {datetime.now().isoformat()}\n\n")
    except Exception:
        pass  # Non-critical
    
    return logger


# ============================================================================
# Scraper Functions
# ============================================================================

def fetch_csaf(ssa_id: str, logger: logging.Logger) -> tuple[Optional[dict], int, str]:
    """
    Fetch CSAF JSON for a single advisory.
    
    Args:
        ssa_id: The SSA identifier (e.g., "SSA-512988")
        logger: Logger instance
    
    Returns:
        Tuple of (data dict or None, HTTP status code, error message)
    """
    url = f"{CSAF_BASE_URL}/{ssa_id.lower()}.json"
    
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        status_code = response.status_code
        
        if status_code == 200:
            return response.json(), status_code, ""
        elif status_code == 404:
            return None, status_code, "Not found (CSAF file does not exist)"
        else:
            return None, status_code, f"HTTP {status_code}"
            
    except requests.Timeout:
        logger.debug(f"Timeout fetching {ssa_id}")
        return None, 0, "Request timeout"
    except requests.ConnectionError as e:
        logger.debug(f"Connection error fetching {ssa_id}: {e}")
        return None, 0, "Connection error"
    except json.JSONDecodeError as e:
        logger.debug(f"JSON decode error for {ssa_id}: {e}")
        return None, 200, "Invalid JSON response"
    except Exception as e:
        logger.debug(f"Unexpected error fetching {ssa_id}: {e}")
        return None, 0, str(e)


def parse_csaf(csaf: dict, ssa_id: str) -> dict:
    """Parse CSAF JSON into our simplified format."""
    doc = csaf.get("document", {})
    vulns = csaf.get("vulnerabilities", [])
    product_tree = csaf.get("product_tree", {})
    
    # Extract CVE IDs
    cve_ids = []
    for vuln in vulns:
        cve = vuln.get("cve")
        if cve:
            cve_ids.append(cve)
    
    # Extract CVSS scores
    cvss_v3 = None
    cvss_v4 = None
    for vuln in vulns:
        for score in vuln.get("scores", []):
            if "cvss_v3" in score:
                cvss_v3 = score["cvss_v3"].get("baseScore")
            if "cvss_v4" in score:
                cvss_v4 = score["cvss_v4"].get("baseScore")
    
    # Extract affected products
    affected_products = []
    branches = product_tree.get("branches", [])
    for branch in branches:
        for sub in branch.get("branches", []):
            product_name = sub.get("name", "")
            for prod in sub.get("branches", []):
                version = prod.get("name", "")
                affected_products.append({
                    "product": product_name,
                    "versions": version,
                    "remediation": "",
                    "cve_id": None
                })
    
    # Extract notes
    summary = ""
    mitigations = []
    recommendations = []
    for note in doc.get("notes", []):
        category = note.get("category", "")
        text = note.get("text", "")
        if category == "summary":
            summary = text
        elif category == "general" and "mitigation" in note.get("title", "").lower():
            mitigations.append(text)
        elif category == "general":
            recommendations.append(text)
    
    tracking = doc.get("tracking", {})
    
    return {
        "ssa_id": ssa_id,
        "title": doc.get("title", ""),
        "cvss_v3_score": cvss_v3,
        "cvss_v4_score": cvss_v4,
        "cve_ids": cve_ids,
        "publication_date": tracking.get("initial_release_date", "")[:10],
        "last_update": tracking.get("current_release_date", "")[:10],
        "version": tracking.get("version", ""),
        "summary": summary,
        "affected_products": affected_products,
        "mitigations": mitigations,
        "general_recommendations": recommendations,
        "html_url": f"https://cert-portal.siemens.com/productcert/html/{ssa_id.lower()}.html",
        "csaf_url": f"{CSAF_BASE_URL}/{ssa_id.lower()}.json",
        "pdf_url": f"https://cert-portal.siemens.com/productcert/pdf/{ssa_id.lower()}.pdf",
        "txt_url": None
    }


def run_scraper(logger: logging.Logger) -> dict:
    """
    Main scraper execution.
    
    Args:
        logger: Logger instance
    
    Returns:
        Dictionary with scrape results and statistics
    """
    start_time = datetime.now()
    
    logger.info("=" * 60)
    logger.info("Siemens CERT Scraper - Starting")
    logger.info("=" * 60)
    logger.info(f"Start time: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"SSA IDs to fetch: {len(SSA_IDS)}")
    logger.info("")
    
    vulnerabilities = []
    
    # Track statistics
    stats = {
        "total_attempted": len(SSA_IDS),
        "successful": 0,
        "failed": 0,
        "failures": [],  # List of (ssa_id, status_code, error)
        "total_cves": 0,
        "total_products": 0,
    }
    
    for i, ssa_id in enumerate(SSA_IDS, 1):
        logger.info(f"[{i:3}/{len(SSA_IDS)}] Fetching {ssa_id}...")
        
        csaf, status_code, error = fetch_csaf(ssa_id, logger)
        
        if csaf:
            vuln = parse_csaf(csaf, ssa_id)
            vulnerabilities.append(vuln)
            
            cve_count = len(vuln['cve_ids'])
            product_count = len(vuln['affected_products'])
            stats["successful"] += 1
            stats["total_cves"] += cve_count
            stats["total_products"] += product_count
            
            logger.info(f"         [OK] Success ({cve_count} CVEs, {product_count} products)")
            logger.debug(f"         Title: {vuln['title'][:60]}...")
        else:
            stats["failed"] += 1
            stats["failures"].append({
                "ssa_id": ssa_id,
                "status_code": status_code,
                "error": error
            })
            logger.warning(f"         [FAIL] {error} (HTTP {status_code})")
        
        # Be polite with request rate
        time.sleep(REQUEST_DELAY)
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    # Log summary
    logger.info("")
    logger.info("=" * 60)
    logger.info("Scrape Complete - Summary")
    logger.info("=" * 60)
    logger.info(f"Duration: {duration:.1f} seconds")
    logger.info(f"Total attempted: {stats['total_attempted']}")
    logger.info(f"Successful: {stats['successful']} ({100*stats['successful']/stats['total_attempted']:.1f}%)")
    logger.info(f"Failed: {stats['failed']} ({100*stats['failed']/stats['total_attempted']:.1f}%)")
    logger.info(f"Total CVEs collected: {stats['total_cves']}")
    logger.info(f"Total affected products: {stats['total_products']}")
    
    if stats["failures"]:
        logger.info("")
        logger.info("Failed SSA IDs:")
        for failure in stats["failures"]:
            logger.info(f"  - {failure['ssa_id']}: {failure['error']} (HTTP {failure['status_code']})")
    
    return {
        "vulnerabilities": vulnerabilities,
        "stats": stats,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_seconds": duration
    }


def export_results(vulnerabilities: list, output_dir: Path, website_data_path: Path, logger: logging.Logger) -> None:
    """
    Export vulnerabilities to JSON files.
    
    Args:
        vulnerabilities: List of vulnerability dictionaries
        output_dir: Directory for scraper output
        website_data_path: Path to website data file
        logger: Logger instance
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output = {
        "metadata": {
            "source": "Siemens ProductCERT",
            "scraped_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "total_count": len(vulnerabilities),
            "url": "https://www.siemens.com/global/en/products/services/cert.html"
        },
        "vulnerabilities": vulnerabilities
    }
    
    # Save to scraper output directory
    output_path = output_dir / "siemens_vulnerabilities.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    logger.info(f"[OK] Saved to {output_path}")
    
    # Copy to website data folder
    website_data_path.parent.mkdir(parents=True, exist_ok=True)
    with open(website_data_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    logger.info(f"[OK] Copied to {website_data_path}")


def main():
    """Main entry point with CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Scrape Siemens ProductCERT security advisories"
    )
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='Minimal console output (warnings and errors only)'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='./output',
        help='Output directory for generated files (default: ./output)'
    )
    
    args = parser.parse_args()
    
    # Setup paths
    script_dir = Path(__file__).parent
    log_dir = script_dir / "logs"
    output_dir = Path(args.output) if Path(args.output).is_absolute() else script_dir / args.output
    website_data_path = script_dir.parent.parent / "data" / "siemens-vulnerabilities.json"
    
    # Setup logging
    logger = setup_logging(log_dir, quiet=args.quiet)
    
    try:
        # Run the scraper
        results = run_scraper(logger)
        
        if not results["vulnerabilities"]:
            logger.error("No vulnerabilities scraped. Exiting.")
            sys.exit(1)
        
        # Export results
        logger.info("")
        export_results(
            results["vulnerabilities"],
            output_dir,
            website_data_path,
            logger
        )
        
        logger.info("")
        logger.info("Done!")
        
        # Return exit code based on success rate
        success_rate = results["stats"]["successful"] / results["stats"]["total_attempted"]
        if success_rate < 0.5:
            logger.warning("Warning: Less than 50% success rate")
            sys.exit(2)
            
    except KeyboardInterrupt:
        logger.warning("\nScraper interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.exception(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
