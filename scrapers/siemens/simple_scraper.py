"""
Simple Siemens CERT Scraper - Fetches CSAF JSON files directly.

Usage:
    python simple_scraper.py
"""
import requests
import json
import time
from datetime import datetime
from pathlib import Path

# Known SSA IDs from Siemens CERT (add more as needed)
# These can be found on https://www.siemens.com/global/en/products/services/cert.html
SSA_IDS = [
    # Page 1 (most recent)
    "SSA-512988", "SSA-915282", "SSA-912274", "SSA-882673", "SSA-868571",
    "SSA-800126", "SSA-763474", "SSA-734261", "SSA-723487", "SSA-654321",
    "SSA-640476", "SSA-563922", "SSA-534283", "SSA-503939", "SSA-494539",
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

def fetch_csaf(ssa_id: str) -> dict | None:
    """Fetch CSAF JSON for a single advisory."""
    url = f"{CSAF_BASE_URL}/{ssa_id.lower()}.json"
    try:
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            return r.json()
        return None
    except Exception as e:
        print(f"  Error fetching {ssa_id}: {e}")
        return None

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

def main():
    print("=" * 60)
    print("Simple Siemens CERT Scraper")
    print("=" * 60)
    print(f"\nFetching {len(SSA_IDS)} advisories...")
    
    vulnerabilities = []
    
    for i, ssa_id in enumerate(SSA_IDS, 1):
        print(f"[{i}/{len(SSA_IDS)}] {ssa_id}...", end=" ")
        
        csaf = fetch_csaf(ssa_id)
        if csaf:
            vuln = parse_csaf(csaf, ssa_id)
            vulnerabilities.append(vuln)
            print(f"✓ ({len(vuln['cve_ids'])} CVEs)")
        else:
            print("✗ Not found")
        
        time.sleep(0.3)  # Be polite
    
    print(f"\n✓ Successfully fetched {len(vulnerabilities)} advisories")
    
    # Export to JSON
    output = {
        "metadata": {
            "source": "Siemens ProductCERT",
            "scraped_at": datetime.utcnow().isoformat() + "Z",
            "total_count": len(vulnerabilities),
            "url": "https://www.siemens.com/global/en/products/services/cert.html"
        },
        "vulnerabilities": vulnerabilities
    }
    
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    output_path = output_dir / "siemens_vulnerabilities.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to {output_path}")
    
    # Also copy to website data folder
    website_data = Path("../../data/siemens-vulnerabilities.json")
    with open(website_data, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Copied to {website_data}")

if __name__ == "__main__":
    main()

