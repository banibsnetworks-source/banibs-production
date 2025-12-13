"""
DDM Engine - Dismissal Detection Model Core Logic

Pattern detection and scoring engine.
This is a DISCERNMENT TOOL, not an accusation system.

All outputs use probabilistic language and require falsifiable testing.
"""

import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

from models.ddm import (
    DDMFeatures,
    DDMObservation,
    DDMScoreResponse,
    DDMTrendAnalysis,
    DDMTimeSeriesEntry,
    ProtectedVariableScores,
    EscalationBand,
    ObservationStatus,
    TestResult
)

logger = logging.getLogger(__name__)


# =============================================================================
# WEIGHTS CONFIGURATION (V1)
# =============================================================================

WEIGHTS_V1 = {
    "f1_ignoring": 0.6,
    "f2_deflection": 0.7,
    "f3_dismissal": 1.0,
    "f4_invalidation": 1.1,
    "f5_substitution": 1.2,
    "f6_zealotry": 1.2,
    "f7_elimination": 1.4,
    "f8_escalation_velocity": 1.5
}

# Max possible raw score (all features at 1.0)
MAX_RAW_SCORE = sum(WEIGHTS_V1.values())  # 8.7

# Escalation band thresholds (normalized 0-100)
BAND_THRESHOLDS = {
    EscalationBand.LOW: (0, 25),
    EscalationBand.MEDIUM: (26, 50),
    EscalationBand.HIGH: (51, 75),
    EscalationBand.CRITICAL: (76, 100)
}

# Escalation ladder (display reference)
ESCALATION_LADDER = [
    "1. Ignoring",
    "2. Deflection",
    "3. Dismissal",
    "4. Invalidation",
    "5. Normalization",
    "6. Substitution",
    "7. Zealotry",
    "8. Elimination",
    "9. Death (theoretical endpoint)"
]


# =============================================================================
# DDM ENGINE CLASS
# =============================================================================

class DDMEngine:
    """
    Core DDM scoring and analysis engine.
    
    IMPORTANT: This engine detects PATTERNS, not guilt.
    All outputs are probabilistic and require human verification.
    """
    
    def __init__(self, weights_version: str = "v1"):
        self.weights_version = weights_version
        self.weights = WEIGHTS_V1 if weights_version == "v1" else WEIGHTS_V1
    
    # -------------------------------------------------------------------------
    # CORE SCORING
    # -------------------------------------------------------------------------
    
    def calculate_ldi(self, features: DDMFeatures) -> Tuple[float, float, Dict[str, float]]:
        """
        Calculate LDI (Lie Defense Index) score.
        
        Returns:
            - ldi_raw: Raw weighted sum
            - ldi_normalized: Normalized to 0-100 scale
            - breakdown: Per-feature contribution
        """
        breakdown = {}
        raw_score = 0.0
        
        feature_dict = {
            "f1_ignoring": features.f1_ignoring,
            "f2_deflection": features.f2_deflection,
            "f3_dismissal": features.f3_dismissal,
            "f4_invalidation": features.f4_invalidation,
            "f5_substitution": features.f5_substitution,
            "f6_zealotry": features.f6_zealotry,
            "f7_elimination": features.f7_elimination,
            "f8_escalation_velocity": features.f8_escalation_velocity
        }
        
        for feature_name, feature_value in feature_dict.items():
            weight = self.weights.get(feature_name, 1.0)
            contribution = feature_value * weight
            breakdown[feature_name] = round(contribution, 3)
            raw_score += contribution
        
        # Normalize to 0-100
        ldi_normalized = (raw_score / MAX_RAW_SCORE) * 100
        ldi_normalized = min(100.0, max(0.0, ldi_normalized))  # Clamp
        
        return raw_score, round(ldi_normalized, 2), breakdown
    
    def determine_escalation_band(self, ldi_score: float) -> EscalationBand:
        """
        Determine escalation band from LDI score.
        These are PROBABILISTIC indicators, not accusations.
        """
        if ldi_score <= 25:
            return EscalationBand.LOW
        elif ldi_score <= 50:
            return EscalationBand.MEDIUM
        elif ldi_score <= 75:
            return EscalationBand.HIGH
        else:
            return EscalationBand.CRITICAL
    
    def calculate_confidence(self, features: DDMFeatures) -> float:
        """
        Calculate confidence score based on feature distribution.
        Higher confidence when features are clearly present or absent.
        Lower confidence for ambiguous middle values.
        """
        feature_values = [
            features.f1_ignoring,
            features.f2_deflection,
            features.f3_dismissal,
            features.f4_invalidation,
            features.f5_substitution,
            features.f6_zealotry,
            features.f7_elimination,
            features.f8_escalation_velocity
        ]
        
        # Confidence is higher when values are near 0 or 1, lower near 0.5
        confidence_sum = 0.0
        for val in feature_values:
            # Distance from 0.5 (ambiguity point)
            distance = abs(val - 0.5)
            confidence_sum += distance * 2  # Scale to 0-1
        
        avg_confidence = confidence_sum / len(feature_values)
        return round(min(1.0, max(0.3, avg_confidence)), 2)  # Floor at 0.3
    
    # -------------------------------------------------------------------------
    # PROTECTED VARIABLE ANALYSIS
    # -------------------------------------------------------------------------
    
    def analyze_protected_variable(self, features: DDMFeatures) -> ProtectedVariableScores:
        """
        Estimate what is likely being protected based on feature patterns.
        These are PROBABILISTIC estimates only.
        """
        # Heuristic analysis based on feature combinations
        # This is a simplified model - can be refined with more data
        
        identity_score = (
            features.f3_dismissal * 0.3 +
            features.f4_invalidation * 0.4 +
            features.f6_zealotry * 0.3
        )
        
        power_score = (
            features.f1_ignoring * 0.2 +
            features.f5_substitution * 0.3 +
            features.f7_elimination * 0.5
        )
        
        narrative_score = (
            features.f2_deflection * 0.3 +
            features.f5_substitution * 0.4 +
            features.f3_dismissal * 0.3
        )
        
        moral_status_score = (
            features.f4_invalidation * 0.3 +
            features.f6_zealotry * 0.4 +
            features.f8_escalation_velocity * 0.3
        )
        
        return ProtectedVariableScores(
            identity=round(min(1.0, identity_score), 2),
            power=round(min(1.0, power_score), 2),
            narrative=round(min(1.0, narrative_score), 2),
            moral_status=round(min(1.0, moral_status_score), 2)
        )
    
    # -------------------------------------------------------------------------
    # RECOMMENDED TESTS
    # -------------------------------------------------------------------------
    
    def get_recommended_tests(self, features: DDMFeatures, ldi_score: float) -> List[str]:
        """
        Recommend which falsifiable tests to run based on pattern.
        """
        recommendations = []
        
        # Always recommend at least one test
        if features.f2_deflection > 0.5 or features.f5_substitution > 0.5:
            recommendations.append(
                "Context Tolerance Test: Check if response varies appropriately in different contexts"
            )
        
        if features.f4_invalidation > 0.5 or features.f3_dismissal > 0.5:
            recommendations.append(
                "Symmetry Test: Verify if the same standard is applied to all parties equally"
            )
        
        if features.f6_zealotry > 0.5 or ldi_score > 50:
            recommendations.append(
                "Clarification Test: Present new information and observe if position changes"
            )
        
        # Default recommendation if none triggered
        if not recommendations:
            recommendations.append(
                "Clarification Test: Start with presenting new information to test openness to update"
            )
        
        return recommendations
    
    # -------------------------------------------------------------------------
    # FULL SCORING RESPONSE
    # -------------------------------------------------------------------------
    
    def score(self, features: DDMFeatures) -> DDMScoreResponse:
        """
        Generate full DDM score response with all analysis.
        """
        raw_score, ldi_normalized, breakdown = self.calculate_ldi(features)
        confidence = self.calculate_confidence(features)
        band = self.determine_escalation_band(ldi_normalized)
        protected = self.analyze_protected_variable(features)
        recommended = self.get_recommended_tests(features, ldi_normalized)
        
        # Generate uncertainty note based on confidence
        if confidence < 0.5:
            uncertainty_note = "Low confidence: Feature scores are ambiguous. Interpret with caution."
        elif confidence < 0.7:
            uncertainty_note = "Moderate confidence: Some ambiguity in feature assessment."
        else:
            uncertainty_note = "Higher confidence in pattern detection, but always verify with tests."
        
        return DDMScoreResponse(
            ldi_score=round(raw_score, 3),
            ldi_score_normalized=int(round(ldi_normalized)),
            ldi_confidence=confidence,
            escalation_band=band,
            feature_breakdown=breakdown,
            protected_variable=protected,
            recommended_tests=recommended,
            uncertainty_note=uncertainty_note
        )
    
    # -------------------------------------------------------------------------
    # TREND ANALYSIS
    # -------------------------------------------------------------------------
    
    def analyze_trend(
        self,
        observations: List[DDMObservation],
        subject_ref: str
    ) -> DDMTrendAnalysis:
        """
        Analyze LDI trend over time for a subject.
        Uses probabilistic language for all conclusions.
        """
        if not observations:
            return DDMTrendAnalysis(
                subject_ref=subject_ref,
                observation_count=0,
                time_series=[],
                trend_summary="No observations available for trend analysis."
            )
        
        # Sort by creation time
        sorted_obs = sorted(observations, key=lambda x: x.created_at)
        
        # Build time series
        time_series = [
            DDMTimeSeriesEntry(
                observation_id=obs.id,
                timestamp=obs.created_at,
                ldi_score=obs.ldi_score,
                escalation_band=obs.escalation_band,
                note=obs.context_title
            )
            for obs in sorted_obs
        ]
        
        # Calculate delta LDI
        delta_ldi = None
        trend_direction = None
        
        if len(sorted_obs) >= 2:
            first_ldi = sorted_obs[0].ldi_score
            last_ldi = sorted_obs[-1].ldi_score
            delta_ldi = round(last_ldi - first_ldi, 2)
            
            if delta_ldi > 5:
                trend_direction = "escalating"
            elif delta_ldi < -5:
                trend_direction = "de-escalating"
            else:
                trend_direction = "stable"
        
        # Generate probabilistic summary
        if len(sorted_obs) == 1:
            trend_summary = "Single observation. Insufficient data for trend analysis."
        elif trend_direction == "escalating":
            trend_summary = f"Pattern suggests possible escalation (Δ LDI: +{delta_ldi}). Monitor for continued pattern."
        elif trend_direction == "de-escalating":
            trend_summary = f"Pattern suggests possible de-escalation (Δ LDI: {delta_ldi}). May indicate positive change."
        else:
            trend_summary = f"Pattern appears relatively stable (Δ LDI: {delta_ldi}). Continue monitoring."
        
        return DDMTrendAnalysis(
            subject_ref=subject_ref,
            observation_count=len(observations),
            time_series=time_series,
            delta_ldi=delta_ldi,
            trend_direction=trend_direction,
            earliest_observation=sorted_obs[0].created_at if sorted_obs else None,
            latest_observation=sorted_obs[-1].created_at if sorted_obs else None,
            trend_summary=trend_summary
        )
    
    # -------------------------------------------------------------------------
    # STATUS DETERMINATION
    # -------------------------------------------------------------------------
    
    def determine_status(self, observation: DDMObservation) -> ObservationStatus:
        """
        Determine observation status based on test completion.
        """
        tests = observation.tests
        
        # Count completed tests
        completed = 0
        has_clarification_fail = False
        
        if tests.context_tolerance.result != TestResult.UNKNOWN:
            completed += 1
        if tests.symmetry.result != TestResult.UNKNOWN:
            completed += 1
        if tests.clarification.result != TestResult.UNKNOWN:
            completed += 1
            if tests.clarification.result == TestResult.FAIL:
                has_clarification_fail = True
        
        # Determine status
        if completed == 0:
            return ObservationStatus.PRELIMINARY
        elif has_clarification_fail:
            return ObservationStatus.DEFENSE_LIKELY
        elif completed == 3:
            return ObservationStatus.VERIFIED
        else:
            return ObservationStatus.IN_REVIEW


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_engine_instance: Optional[DDMEngine] = None

def get_ddm_engine(weights_version: str = "v1") -> DDMEngine:
    """Get or create DDM engine instance"""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = DDMEngine(weights_version)
    return _engine_instance
