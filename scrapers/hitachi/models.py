"""
Data models for Hitachi vulnerability data.
"""
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class AffectedProduct:
    """Represents an affected product with version and remediation info."""
    product: str
    versions: str
    fixed_version: str = ""
    cve_id: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class HitachiVulnerability:
    """Represents a Hitachi security advisory."""
    advisory_id: str  # e.g., hitachi-sec-2025-133
    title: str
    cve_ids: list[str] = field(default_factory=list)
    cvss_scores: dict = field(default_factory=dict)  # CVE ID -> CVSS score mapping
    description: str = ""
    publication_date: str = ""
    last_update: str = ""
    affected_products: list[AffectedProduct] = field(default_factory=list)
    fixed_products: list[str] = field(default_factory=list)
    html_url: str = ""

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        data['affected_products'] = [p if isinstance(p, dict) else asdict(p) for p in self.affected_products]
        return data

    @property
    def max_cvss_score(self) -> Optional[float]:
        """Return the highest CVSS score available."""
        if not self.cvss_scores:
            return None
        scores = [s for s in self.cvss_scores.values() if s is not None]
        return max(scores) if scores else None

    @property
    def severity(self) -> str:
        """Return severity level based on CVSS score."""
        score = self.max_cvss_score
        if score is None:
            return "Unknown"
        if score >= 9.0:
            return "Critical"
        if score >= 7.0:
            return "High"
        if score >= 4.0:
            return "Medium"
        return "Low"
