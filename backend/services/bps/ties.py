"""
TIES - Truth & Integrity Engine System
Version 1.0 - Phase 1 Implementation

Purpose: Validate BANIBS messaging for accuracy, clarity, and safe phrasing.
"""

import re
from typing import List, Dict, Any
from backend.models.bps.models import (
    TIESInput,
    TIESOutput,
    TIESIssue,
    TIESRewrite,
    Verdict,
    FactsConfig
)


class TIESEngine:
    """
    TIES - Truth & Integrity Engine System
    
    Validates content against:
    - Accuracy requirements
    - Prohibited statements
    - Overclaiming patterns
    - Factual misrepresentations
    """
    
    # Detection patterns for problematic content
    ABSOLUTE_TERMS = [
        r'\b(never|always|all|none|every|impossible|guaranteed|perfect|completely|totally|absolutely)\b',
        r'\b(no algorithms?|zero algorithms?)\b',
        r'\b(100%|entirely|fully automated)\b'
    ]
    
    PROHIBITED_PATTERNS = [
        # Political positioning
        r'\b(left-wing|right-wing|liberal|conservative) (bias|agenda)\b',
        r'\b(fake news|propaganda)\b',
        
        # Overclaiming
        r'\bguarantee[sd]? (privacy|security|safety)\b',
        r'\bcompletely (secure|private|encrypted)\b',
        r'\bunhackable\b',
        
        # Blame/accusation
        r'\b(guilty|innocent|criminal|perpetrator)\b',
        r'\b(deliberately|intentionally) (misled|deceived)\b',
        
        # Speculative statements
        r'\bwill (prove|show|reveal) (guilt|innocence)\b',
        r'\bis (clearly|obviously|undoubtedly) (guilty|innocent)\b',
    ]
    
    FUTURE_FEATURES_PATTERNS = [
        r'\bnow (available|live|ready)\b.*?(feature|capability|system)',
        r'\bcurrently (supports?|offers?|provides?)\b.*?(coming soon|planned|future)'
    ]
    
    CAPABILITY_CLAIMS = {
        # Key: claim pattern, Value: (is_accurate, correction)
        'no_algorithms': (False, "BANIBS uses algorithms for content ranking and recommendations, but prioritizes transparency"),
        'no_tracking': (False, "BANIBS minimizes tracking and does not sell data, but uses analytics for platform improvement"),
        'fully_encrypted': (False, "BANIBS uses encryption for sensitive data, but not all platform functions are end-to-end encrypted"),
        'zero_ads': (True, "BANIBS is ad-free"),
        'independent': (True, "BANIBS is independently operated"),
    }
    
    def __init__(self, default_facts_config: FactsConfig = None):
        self.default_facts_config = default_facts_config or self._get_default_config()
    
    def _get_default_config(self) -> FactsConfig:
        """Get default facts configuration for BANIBS"""
        return FactsConfig(
            allowed_claims=[
                "BANIBS is ad-free",
                "BANIBS is independently operated",
                "BANIBS does not sell user data",
                "BANIBS uses encryption for sensitive data",
                "BANIBS prioritizes Black businesses and communities",
            ],
            prohibited_phrases=[
                "no algorithms",
                "completely secure",
                "guaranteed privacy",
                "unhackable",
                "100% accurate",
                "zero risk",
            ],
            requires_verification=[
                "encryption claims",
                "privacy guarantees",
                "security statements",
                "feature availability",
                "capability descriptions",
            ],
            platform_capabilities={
                "ad_free": True,
                "data_selling": False,
                "encryption": True,  # Partial/selective
                "independent": True,
                "algorithm_free": False,
                "zero_tracking": False,
            }
        )
    
    def analyze(self, input_data: TIESInput) -> TIESOutput:
        """
        Main analysis function
        
        Args:
            input_data: TIESInput containing content and config
            
        Returns:
            TIESOutput with verdict, issues, and rewrites
        """
        content = input_data.content
        facts_config = input_data.facts_config or self.default_facts_config
        
        issues: List[TIESIssue] = []
        rewrites: List[TIESRewrite] = []
        processing_notes: List[str] = []
        
        # Run detection rules
        issues.extend(self._detect_absolute_terms(content))
        issues.extend(self._detect_prohibited_patterns(content))
        issues.extend(self._detect_future_features(content))
        issues.extend(self._detect_capability_misstatements(content, facts_config))
        issues.extend(self._detect_prohibited_phrases(content, facts_config))
        
        # Generate rewrites for critical issues
        for issue in issues:
            if issue.severity in ["moderate", "critical"]:
                rewrite = self._generate_rewrite(issue, content)
                if rewrite:
                    rewrites.append(rewrite)
        
        # Determine verdict
        verdict = self._determine_verdict(issues)
        
        # Add processing notes
        processing_notes.append(f"Analyzed {len(content.split())} words")
        processing_notes.append(f"Found {len(issues)} issues")
        processing_notes.append(f"Verdict: {verdict}")
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence(issues, content)
        
        return TIESOutput(
            verdict=verdict,
            issues=issues,
            suggested_rewrites=rewrites,
            confidence_score=confidence_score,
            processing_notes=processing_notes
        )
    
    def _detect_absolute_terms(self, content: str) -> List[TIESIssue]:
        """Detect absolute statements that may be inaccurate"""
        issues = []
        
        for pattern in self.ABSOLUTE_TERMS:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                context = self._get_context(content, match.start(), match.end())
                issues.append(TIESIssue(
                    type="absolute_statement",
                    description=f"Absolute term detected: '{match.group()}'. May be inaccurate or unprovable.",
                    severity="moderate",
                    location=context
                ))
        
        return issues
    
    def _detect_prohibited_patterns(self, content: str) -> List[TIESIssue]:
        """Detect prohibited patterns (blame, accusations, speculation)"""
        issues = []
        
        for pattern in self.PROHIBITED_PATTERNS:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                context = self._get_context(content, match.start(), match.end())
                issues.append(TIESIssue(
                    type="prohibited_pattern",
                    description=f"Prohibited content detected: '{match.group()}'. May involve blame, accusation, or speculation.",
                    severity="critical",
                    location=context
                ))
        
        return issues
    
    def _detect_future_features(self, content: str) -> List[TIESIssue]:
        """Detect future features described as currently available"""
        issues = []
        
        for pattern in self.FUTURE_FEATURES_PATTERNS:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                context = self._get_context(content, match.start(), match.end())
                issues.append(TIESIssue(
                    type="future_feature_claim",
                    description="Future feature may be described as currently available",
                    severity="critical",
                    location=context
                ))
        
        return issues
    
    def _detect_capability_misstatements(self, content: str, config: FactsConfig) -> List[TIESIssue]:
        """Detect misstatements about BANIBS capabilities"""
        issues = []
        
        for claim_key, (is_accurate, correction) in self.CAPABILITY_CLAIMS.items():
            if not is_accurate:
                # Check if this inaccurate claim appears in content
                claim_patterns = {
                    'no_algorithms': r'\bno algorithms?\b',
                    'no_tracking': r'\b(no|zero) tracking\b',
                    'fully_encrypted': r'\bfully encrypted\b',
                }
                
                pattern = claim_patterns.get(claim_key)
                if pattern and re.search(pattern, content, re.IGNORECASE):
                    issues.append(TIESIssue(
                        type="capability_misstatement",
                        description=f"Inaccurate capability claim. Correction: {correction}",
                        severity="critical",
                        location=re.search(pattern, content, re.IGNORECASE).group()
                    ))
        
        return issues
    
    def _detect_prohibited_phrases(self, content: str, config: FactsConfig) -> List[TIESIssue]:
        """Detect prohibited phrases from facts_config"""
        issues = []
        
        for phrase in config.prohibited_phrases:
            if re.search(rf'\b{re.escape(phrase)}\b', content, re.IGNORECASE):
                issues.append(TIESIssue(
                    type="prohibited_phrase",
                    description=f"Prohibited phrase detected: '{phrase}'",
                    severity="critical",
                    location=phrase
                ))
        
        return issues
    
    def _generate_rewrite(self, issue: TIESIssue, content: str) -> TIESRewrite:
        """Generate suggested rewrite for an issue"""
        
        # Rewrite rules based on issue type
        rewrite_rules = {
            "absolute_statement": {
                "never": "rarely",
                "always": "typically",
                "all": "most",
                "none": "few",
                "guaranteed": "designed to provide",
                "completely": "largely",
                "no algorithms": "transparent algorithms",
            },
            "capability_misstatement": {
                "no algorithms": "transparent, user-focused algorithms",
                "no tracking": "minimal tracking for essential platform functions only",
                "fully encrypted": "encryption for sensitive data",
            }
        }
        
        rules = rewrite_rules.get(issue.type, {})
        
        for original_phrase, replacement in rules.items():
            if issue.location and original_phrase.lower() in issue.location.lower():
                return TIESRewrite(
                    original=issue.location,
                    suggested=issue.location.replace(original_phrase, replacement),
                    reason=issue.description
                )
        
        return None
    
    def _determine_verdict(self, issues: List[TIESIssue]) -> Verdict:
        """Determine overall verdict based on issues"""
        if not issues:
            return Verdict.OK
        
        # Check for critical issues
        critical_count = sum(1 for issue in issues if issue.severity == "critical")
        if critical_count > 0:
            return Verdict.BLOCK
        
        # Check for moderate issues
        moderate_count = sum(1 for issue in issues if issue.severity == "moderate")
        if moderate_count >= 3:
            return Verdict.WARN
        elif moderate_count > 0:
            return Verdict.WARN
        
        return Verdict.OK
    
    def _calculate_confidence(self, issues: List[TIESIssue], content: str) -> float:
        """Calculate confidence score for the analysis"""
        if not content.strip():
            return 0.0
        
        # Base confidence
        confidence = 1.0
        
        # Reduce confidence for each issue
        confidence -= len(issues) * 0.1
        
        # Ensure within bounds
        return max(0.0, min(1.0, confidence))
    
    def _get_context(self, content: str, start: int, end: int, window: int = 30) -> str:
        """Get context around a match"""
        context_start = max(0, start - window)
        context_end = min(len(content), end + window)
        context = content[context_start:context_end].strip()
        
        if context_start > 0:
            context = "..." + context
        if context_end < len(content):
            context = context + "..."
        
        return context
