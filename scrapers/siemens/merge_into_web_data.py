"""
Merge newly scraped Siemens data into the UI dataset.

This script replaces any existing entries in `data/siemens-vulnerabilities.json`
that share the same `ssa_id` as entries in the newly scraped JSON.
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def merge_by_ssa_id(
    existing_vulnerabilities: list[dict],
    new_vulnerabilities: list[dict],
) -> list[dict]:
    index_by_id: dict[str, int] = {
        v.get("ssa_id"): i for i, v in enumerate(existing_vulnerabilities) if v.get("ssa_id")
    }

    merged = list(existing_vulnerabilities)
    for vuln in new_vulnerabilities:
        vuln_id = vuln.get("ssa_id")
        if not vuln_id:
            continue

        if vuln_id in index_by_id:
            merged[index_by_id[vuln_id]] = vuln
        else:
            index_by_id[vuln_id] = len(merged)
            merged.append(vuln)

    return merged


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Merge Siemens scraped advisory JSON into UI dataset"
    )
    parser.add_argument("--input", required=True, help="Path to siemens_vulnerabilities.json")
    parser.add_argument("--target", required=True, help="Path to data/siemens-vulnerabilities.json")
    args = parser.parse_args()

    input_path = Path(args.input)
    target_path = Path(args.target)

    input_data = load_json(input_path)
    target_data = load_json(target_path)

    existing_vulnerabilities = target_data.get("vulnerabilities", [])
    new_vulnerabilities = input_data.get("vulnerabilities", [])

    merged_vulnerabilities = merge_by_ssa_id(
        existing_vulnerabilities=existing_vulnerabilities,
        new_vulnerabilities=new_vulnerabilities,
    )

    target_metadata = target_data.get("metadata", {})
    target_metadata["total_count"] = len(merged_vulnerabilities)
    target_metadata["scraped_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    target_data["metadata"] = target_metadata
    target_data["vulnerabilities"] = merged_vulnerabilities

    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(target_data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()

