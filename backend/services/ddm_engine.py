"""
DDM Engine - Dismissal Detection Model Core Logic v1.2
EXPANDED SPECIFICATION

Pattern detection and scoring engine.
This is a DISCERNMENT TOOL, not an accusation system.

PRIME DIRECTIVES ENFORCED:
D0. Pattern Detection Only
D1. Guardrails Enforced by Code
D2. Default Private/Internal
D3. Apply Inward First
D4. Safety Copy Required

All outputs use probabilistic language and require falsifiable testing.
"""

import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta

from models.ddm import (
    DDMFeatures,
    DDMObservation,
    DDMScoreResponse,
    DDMTrendAnalysis,
    DDMTimeSeriesEntry,
    ProtectedVariableScores,
    EscalationBand,
    ObservationStatus,
    TestResult,
    DDMTests,
    ESCALATION_LADDER
)

logger = logging.getLogger(__name__)


# =============================================================================
# WEIGHTS CONFIGURATION (V1 - LOCKED)
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

# Band thresholds (normalized 0-100)
BAND_THRESHOLDS = {
    EscalationBand.LOW: (0, 25),
    EscalationBand.MEDIUM: (26, 50),
    EscalationBand.HIGH: (51, 75),
    EscalationBand.CRITICAL: (76, 100)
}

# Feature to escalation stage mapping
FEATURE_TO_STAGE = {
    "f1_ignoring": 1,
    "f2_deflection": 2,
    "f3_dismissal": 3,
    "f4_invalidation": 4,
    # Stage 5 (Normalization) is user-marked, not auto-detected
    "f5_substitution": 6,
    "f6_zealotry": 7,
    "f7_elimination": 8,
    # Stage 9 (Death) CANNOT be auto-inferred - requires explicit confirmation
}


# =============================================================================
# DDM ENGINE CLASS
# =============================================================================

class DDMEngine:
    """
    Core DDM scoring and analysis engine.
    
    IMPORTANT: This engine detects PATTERNS, not guilt.
    All outputs are probabilistic and require human verification.
    
    PRIME DIRECTIVES:
    - D0: Never outputs "liar/guilty/evil" language
    - D1: Finalization blocked without tests (enforced here)
    - D3: Default subject_type should be "self"
    - D4: All outputs include disclaimers
    """
    
    def __init__(self, weights_version: str = "ddm-v1-weights"):
        self.weights_version = weights_version
        self.weights = WEIGHTS_V1
    
    # -------------------------------------------------------------------------
    # CORE SCORING (Section 7.1)
    # -------------------------------------------------------------------------
    
    def calculate_ldi(self, features: DDMFeatures) -> Tuple[float, float, Dict[str, float]]:
        """
        Calculate LDI (Lie Defense Index) score.
        
        Formula: ldi_raw = Σ (w_i * f_i)
        Normalized: ldi_100 = (ldi_raw / max_raw) * 100
        
        Returns:
            - ldi_raw: Raw weighted sum
            - ldi_100: Normalized to 0-100 scale
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
        ldi_100 = (raw_score / MAX_RAW_SCORE) * 100
        ldi_100 = min(100.0, max(0.0, ldi_100))  # Clamp
        
        return round(raw_score, 3), round(ldi_100, 1), breakdown
    
    # -------------------------------------------------------------------------
    # BAND DETERMINATION (Section 7.2)
    # -------------------------------------------------------------------------
    
    def determine_escalation_band(self, ldi_100: float) -> EscalationBand:
        """
        Determine escalation band from LDI score.
        These are PROBABILISTIC indicators, not accusations.
        """
        if ldi_100 <= 25:
            return EscalationBand.LOW
        elif ldi_100 <= 50:
            return EscalationBand.MEDIUM
        elif ldi_100 <= 75:
            return EscalationBand.HIGH
        else:
            return EscalationBand.CRITICAL
    
    # -------------------------------------------------------------------------
    # ESCALATION STAGE INFERENCE (Section 7.3)
    # -------------------------------------------------------------------------
    
    def infer_escalation_stage(
        self, 
        features: DDMFeatures, 
        stage_9_confirmed: bool = False
    ) -> Optional[int]:
        """
        Infer the observed escalation stage based on dominant features.
        
        CRITICAL: Stage 9 (Death) CANNOT be auto-inferred.
        It requires explicit user confirmation (D1 guardrail).
        """
        feature_values = {
            "f1_ignoring": features.f1_ignoring,
            "f2_deflection": features.f2_deflection,
            "f3_dismissal": features.f3_dismissal,
            "f4_invalidation": features.f4_invalidation,
            "f5_substitution": features.f5_substitution,
            "f6_zealotry": features.f6_zealotry,
            "f7_elimination": features.f7_elimination,
        }
        
        # Find dominant feature (highest value)
        if not any(v > 0.3 for v in feature_values.values()):
            return None  # No clear dominant feature
        
        dominant_feature = max(feature_values, key=feature_values.get)
        dominant_value = feature_values[dominant_feature]
        
        if dominant_value < 0.3:
            return None
        
        inferred_stage = FEATURE_TO_STAGE.get(dominant_feature)
        
        # Stage 9 guard (D1 enforcement)
        if stage_9_confirmed:
            return 9
        
        return inferred_stage
    
    # -------------------------------------------------------------------------
    # CONFIDENCE CALCULATION (Section 7.4)
    # -------------------------------------------------------------------------
    
    def calculate_confidence(
        self, 
        features: DDMFeatures, 
        tests: Optional[DDMTests] = None
    ) -> float:
        """
        Calculate confidence score.
        
        Formula: confidence = clamp(
            0.35 + 0.5*(nonzero_features/8) + 0.15*(tests_completed/3),
            0, 1
        )
        
        Conservative by design.
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
        
        # Count non-zero features (threshold 0.1)
        nonzero_count = sum(1 for v in feature_values if v > 0.1)
        
        # Count completed tests
        tests_completed = 0
        if tests:
            tests_completed = tests.get_completed_count()
        
        # Apply formula
        confidence = 0.35 + 0.5 * (nonzero_count / 8) + 0.15 * (tests_completed / 3)
        
        return round(min(1.0, max(0.0, confidence)), 2)
    
    # -------------------------------------------------------------------------
    # PROTECTED VARIABLE INFERENCE (Section 7.5)
    # -------------------------------------------------------------------------
    
    def infer_protected_variable(self, features: DDMFeatures) -> Tuple[ProtectedVariableScores, float]:
        """
        Estimate what is likely being protected based on feature patterns.
        
        Formulas (v1 heuristic, user-overridable):
        - identity = clamp(0.2 + 0.6*f4 + 0.4*f6, 0, 1)
        - power = clamp(0.2 + 0.5*f7 + 0.3*f2 + 0.2*f1, 0, 1)
        - narrative = clamp(0.2 + 0.5*f5 + 0.3*f3 + 0.2*f2, 0, 1)
        - moral_status = clamp(0.2 + 0.5*f6 + 0.3*f3, 0, 1)
        
        These are PROBABILISTIC estimates only.
        """
        f1 = features.f1_ignoring
        f2 = features.f2_deflection
        f3 = features.f3_dismissal
        f4 = features.f4_invalidation
        f5 = features.f5_substitution
        f6 = features.f6_zealotry
        f7 = features.f7_elimination
        
        identity_score = min(1.0, 0.2 + 0.6 * f4 + 0.4 * f6)
        power_score = min(1.0, 0.2 + 0.5 * f7 + 0.3 * f2 + 0.2 * f1)
        narrative_score = min(1.0, 0.2 + 0.5 * f5 + 0.3 * f3 + 0.2 * f2)
        moral_status_score = min(1.0, 0.2 + 0.5 * f6 + 0.3 * f3)
        
        scores = ProtectedVariableScores(
            identity=round(identity_score, 2),
            power=round(power_score, 2),
            narrative=round(narrative_score, 2),
            moral_status=round(moral_status_score, 2)
        )
        
        # Confidence based on score variance (higher variance = lower confidence)
        values = [identity_score, power_score, narrative_score, moral_status_score]
        avg = sum(values) / len(values)
        variance = sum((v - avg) ** 2 for v in values) / len(values)
        confidence = round(min(1.0, 0.5 + 0.5 * (1 - variance)), 2)
        
        return scores, confidence
    
    # -------------------------------------------------------------------------
    # RECOMMENDED TESTS
    # -------------------------------------------------------------------------
    
    def suggest_next_test(
        self, 
        features: DDMFeatures, 
        ldi_100: float,
        tests: Optional[DDMTests] = None
    ) -> str:
        """
        Recommend which falsifiable test to run next based on pattern.
        """
        # Check which tests are already done
        done = set()
        if tests:
            if tests.context_tolerance.result != TestResult.UNKNOWN:
                done.add("context_tolerance")
            if tests.symmetry.result != TestResult.UNKNOWN:
                done.add("symmetry")
            if tests.clarification.result != TestResult.UNKNOWN:
                done.add("clarification")
        
        # Prioritize based on feature patterns
        if "context_tolerance" not in done and (features.f2_deflection > 0.5 or features.f5_substitution > 0.5):
            return "context_tolerance"
        
        if "symmetry" not in done and (features.f4_invalidation > 0.5 or features.f3_dismissal > 0.5):
            return "symmetry"
        
        if "clarification" not in done and (features.f6_zealotry > 0.5 or ldi_100 > 50):
            return "clarification"
        
        # Default recommendation
        if "clarification" not in done:
            return "clarification"
        elif "symmetry" not in done:
            return "symmetry"
        elif "context_tolerance" not in done:
            return "context_tolerance"
        
        return "all_complete"
    
    # -------------------------------------------------------------------------
    # GUARDRAIL VALIDATION (D1 Enforcement)
    # -------------------------------------------------------------------------
    
    def validate_finalization(self, observation: DDMObservation) -> Tuple[bool, str]:
        """
        Validate if an observation can be finalized.
        
        D1 ENFORCEMENT:
        - At least one test must have result != UNKNOWN
        - OR user must explicitly accept "Preliminary" status
        - Stage 9 requires explicit confirmation
        
        Returns: (can_finalize, reason)
        """
        tests = observation.tests
        
        # Check test completion
        if not tests.can_finalize():
            return False, "At least one falsifiable test must be completed to finalize. Mark as 'preliminary' instead."
        
        # Check guardrail acknowledgment
        if not observation.guardrail_ack:
            return False, "Guardrail acknowledgment required: confirm this is for discernment only."
        
        # Stage 9 check
        if observation.escalation_stage_observed == 9 and not observation.stage_9_explicit_confirmation:
            return False, "Stage 9 (Death context) requires explicit confirmation. Cannot be auto-inferred."
        
        return True, "Finalization allowed"
    
    # -------------------------------------------------------------------------
    # UNCERTAINTY NOTE GENERATION (D4)
    # -------------------------------------------------------------------------
    
    def generate_uncertainty_note(self, confidence: float, tests: Optional[DDMTests] = None) -> str:
        """
        Generate human-readable uncertainty note.
        Uses ALLOWED language only (D0 compliance).
        """
        tests_done = 0
        if tests:
            tests_done = tests.get_completed_count()
        
        if confidence < 0.4:
            base = "Low confidence: Feature assessment appears ambiguous."
        elif confidence < 0.6:
            base = "Moderate confidence: Some pattern indicators present."
        elif confidence < 0.8:
            base = "Higher confidence in pattern detection."
        else:
            base = "Strong pattern indicators detected."
        
        if tests_done == 0:
            base += " No falsifiable tests completed — interpret with significant caution."
        elif tests_done < 3:
            base += f" {tests_done}/3 tests completed — further verification recommended."
        else:
            base += " All tests completed."
        
        return base
    
    # -------------------------------------------------------------------------
    # FULL SCORING RESPONSE
    # -------------------------------------------------------------------------
    
    def score(
        self, 
        features: DDMFeatures,
        tests: Optional[DDMTests] = None,
        stage_9_confirmed: bool = False,
        observation_id: str = None
    ) -> DDMScoreResponse:
        """
        Generate full DDM score response with all analysis.
        """
        # Calculate core metrics
        ldi_raw, ldi_100, breakdown = self.calculate_ldi(features)
        band = self.determine_escalation_band(ldi_100)
        stage = self.infer_escalation_stage(features, stage_9_confirmed)
        confidence = self.calculate_confidence(features, tests)
        protected, pv_confidence = self.infer_protected_variable(features)
        recommended = self.suggest_next_test(features, ldi_100, tests)
        uncertainty = self.generate_uncertainty_note(confidence, tests)
        
        # Determine status
        status = ObservationStatus.PRELIMINARY
        if tests and tests.can_finalize():
            status = ObservationStatus.FINALIZED
        
        return DDMScoreResponse(
            id=observation_id or "preview",
            ldi_raw=ldi_raw,
            ldi_100=ldi_100,
            band=band,
            confidence=confidence,
            escalation_stage_observed=stage,
            feature_breakdown=breakdown,
            protected_variable=protected,
            protected_variable_confidence=pv_confidence,
            recommended_next_test=recommended,
            status=status,
            uncertainty_note=uncertainty
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
        Uses probabilistic language for all conclusions (D4).
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
                subject_ref=subject_ref,
                ts=obs.created_at,
                ldi_100=obs.ldi_100,
                escalation_band=obs.escalation_band,
                note=obs.context_title
            )
            for obs in sorted_obs
        ]
        
        # Calculate delta LDI and rate
        delta_ldi = None
        delta_ldi_per_day = None
        trend_direction = None
        
        if len(sorted_obs) >= 2:
            first = sorted_obs[0]
            last = sorted_obs[-1]
            
            delta_ldi = round(last.ldi_100 - first.ldi_100, 2)
            
            # Calculate time span
            time_span = (last.created_at - first.created_at).total_seconds()
            days = time_span / 86400 if time_span > 0 else 1
            delta_ldi_per_day = round(delta_ldi / days, 3) if days > 0 else 0
            
            # Determine direction
            if delta_ldi > 5:
                trend_direction = "escalating"
            elif delta_ldi < -5:
                trend_direction = "de-escalating"
            else:
                trend_direction = "stable"
        
        # Generate probabilistic summary (D4)
        if len(sorted_obs) == 1:
            trend_summary = "Single observation. Insufficient data for trend analysis."
        elif trend_direction == "escalating":
            trend_summary = f"Pattern suggests possible escalation (Δ LDI: +{delta_ldi}). This may indicate intensifying defense patterns."
        elif trend_direction == "de-escalating":
            trend_summary = f"Pattern suggests possible de-escalation (Δ LDI: {delta_ldi}). This may indicate positive change."
        else:
            trend_summary = f"Pattern appears relatively stable (Δ LDI: {delta_ldi}). Continue monitoring for changes."
        
        return DDMTrendAnalysis(
            subject_ref=subject_ref,
            observation_count=len(observations),
            time_series=time_series,
            delta_ldi=delta_ldi,
            delta_ldi_per_day=delta_ldi_per_day,
            trend_direction=trend_direction,
            earliest_observation=sorted_obs[0].created_at if sorted_obs else None,
            latest_observation=sorted_obs[-1].created_at if sorted_obs else None,
            trend_summary=trend_summary
        )
    
    # -------------------------------------------------------------------------
    # INWARD-FIRST REMINDER (D3)
    # -------------------------------------------------------------------------
    
    def get_inward_first_reminder(self, subject_type: str) -> Optional[str]:
        """
        Generate inward-first reminder if analyzing external subject.
        D3 enforcement: encourage self-analysis before external analysis.
        """
        if subject_type != "self":
            return (
                "DDM Reminder: Before analyzing others, consider applying these features "
                "to your own responses. Could any of these patterns describe your communication too?"
            )
        return None


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_engine_instance: Optional[DDMEngine] = None

def get_ddm_engine(weights_version: str = "ddm-v1-weights") -> DDMEngine:
    """Get or create DDM engine instance"""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = DDMEngine(weights_version)
    return _engine_instance
