"""
Data models for Siemens vulnerability data.
"""
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class AffectedProduct:
    """Represents an affected product with version and remediation info."""
    product: str
    versions: str
    remediation: str
    cve_id: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class SiemensVulnerability:
    """Represents a Siemens security advisory."""
    ssa_id: str
    title: str
    cvss_v3_score: Optional[float] = None
    cvss_v4_score: Optional[float] = None
    cve_ids: list[str] = field(default_factory=list)
    publication_date: str = ""
    last_update: str = ""
    version: str = ""
    summary: str = ""
    affected_products: list[AffectedProduct] = field(default_factory=list)
    mitigations: list[str] = field(default_factory=list)
    general_recommendations: list[str] = field(default_factory=list)
    html_url: str = ""
    csaf_url: Optional[str] = None
    pdf_url: Optional[str] = None
    txt_url: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        data['affected_products'] = [p if isinstance(p, dict) else asdict(p) for p in self.affected_products]
        return data

    @property
    def max_cvss_score(self) -> Optional[float]:
        """Return the highest CVSS score available."""
        scores = [s for s in [self.cvss_v3_score, self.cvss_v4_score] if s is not None]
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

