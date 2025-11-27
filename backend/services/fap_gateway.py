"""
BANIBS Founder Authentication Protocol (FAP) Command Gateway
Phase X - 21-Layer Security Foundation

Central gateway that all FAP-protected commands must pass through.
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
from uuid import uuid4
from motor.motor_asyncio import AsyncIOMotorDatabase

from schemas.fap import (
    CommandAuthorizationRequest, CommandAuthorizationResult,
    CommandDecision, VerificationStatus, RiskLevel
)
from services.fap_pipeline import FAPVerificationPipeline
from db.fap import (
    get_fap_config, log_security_event, save_command_authorization,
    get_registered_command
)


class FAPCommandGateway:
    """
    FAP Command Gateway
    
    All high-risk commands must be routed through this gateway.
    It evaluates the 21-layer verification pipeline and makes allow/deny decisions.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.pipeline = None
    
    async def initialize(self):
        """Initialize the gateway with current FAP configuration"""
        fap_config = await get_fap_config(self.db)
        self.pipeline = FAPVerificationPipeline(fap_config)
    
    async def authorize_command(
        self,
        request: CommandAuthorizationRequest,
        context: Dict
    ) -> CommandAuthorizationResult:
        """
        Authorize a command through the FAP pipeline
        
        Args:
            request: Command authorization request
            context: Execution context (session, device, etc.)
        
        Returns:
            Authorization result with decision
        """
        
        # Generate authorization ID
        authorization_id = str(uuid4())
        
        # Log the authorization attempt
        await log_security_event(
            self.db,
            event_type="command_authorization_requested",
            severity="info",
            details=f"Authorization requested for command: {request.command_name}",
            founder_user_id=request.requested_by,
            command_name=request.command_name,
            authorization_id=authorization_id,
            metadata={
                "risk_level": request.risk_level.value,
                "command_category": request.command_category
            }
        )
        
        # Evaluate all verification layers
        if not self.pipeline:
            await self.initialize()
        
        layer_results = await self.pipeline.evaluate_all_layers(request, context)
        
        # Analyze results
        passed_count = sum(1 for r in layer_results if r.status == VerificationStatus.PASSED)
        failed_count = sum(1 for r in layer_results if r.status == VerificationStatus.FAILED)
        stub_count = sum(1 for r in layer_results if r.status == VerificationStatus.STUB)
        
        # Determine decision
        decision, reasons = self._make_decision(
            request, layer_results, passed_count, failed_count, stub_count
        )
        
        # Calculate hold time if needed
        hold_until = None
        if decision == CommandDecision.HOLD_FOR_REVIEW:
            delay_hours = request.delay_hours or 24
            hold_until = datetime.utcnow() + timedelta(hours=delay_hours)
        
        # Build result
        result = CommandAuthorizationResult(
            authorization_id=authorization_id,
            command_name=request.command_name,
            decision=decision,
            risk_level=request.risk_level,
            layers_evaluated=layer_results,
            passed_layers=passed_count,
            failed_layers=failed_count,
            reasons=reasons,
            hold_until=hold_until,
            requires_reconfirmation=(request.risk_level == RiskLevel.SOVEREIGN)
        )
        
        # Save authorization result
        await save_command_authorization(self.db, result)
        
        # Log the decision
        await log_security_event(
            self.db,
            event_type="command_authorization_decision",
            severity="critical" if decision == CommandDecision.DENY else "info",
            details=f"Authorization {decision.value} for command: {request.command_name}",
            founder_user_id=request.requested_by,
            command_name=request.command_name,
            authorization_id=authorization_id,
            decision=decision.value,
            metadata={
                "passed_layers": passed_count,
                "failed_layers": failed_count,
                "stub_layers": stub_count,
                "reasons": reasons
            }
        )
        
        return result
    
    def _make_decision(
        self,
        request: CommandAuthorizationRequest,
        layer_results,
        passed_count: int,
        failed_count: int,
        stub_count: int
    ) -> tuple[CommandDecision, list]:
        """
        Make authorization decision based on layer results
        
        Returns:
            (decision, reasons)
        """
        reasons = []
        
        # If any critical layers failed, deny
        critical_failures = [
            r for r in layer_results 
            if r.status == VerificationStatus.FAILED and r.layer_number in [1, 2, 8, 21]
        ]
        
        if critical_failures:
            for failure in critical_failures:
                reasons.append(f"Critical layer failed: {failure.layer_name} - {failure.details}")
            return CommandDecision.DENY, reasons
        
        # If too many layers failed (>3), deny
        if failed_count > 3:
            reasons.append(f"Too many verification failures ({failed_count} layers)")
            return CommandDecision.DENY, reasons
        
        # If sovereign-level command requires delay, hold
        if request.risk_level == RiskLevel.SOVEREIGN and request.requires_delay:
            reasons.append(f"Sovereign command requires {request.delay_hours}h hold period")
            return CommandDecision.HOLD_FOR_REVIEW, reasons
        
        # If high-risk command has any failures, require confirmation
        if request.risk_level in [RiskLevel.HIGH, RiskLevel.SOVEREIGN] and failed_count > 0:
            reasons.append(f"{failed_count} layer(s) failed - manual confirmation required")
            return CommandDecision.REQUIRES_CONFIRMATION, reasons
        
        # Check stub count for high-risk commands
        if request.risk_level == RiskLevel.SOVEREIGN and stub_count > 10:
            reasons.append("Multiple security layers not yet implemented - proceed with caution")
            return CommandDecision.REQUIRES_CONFIRMATION, reasons
        
        # If we got here, allow the command
        reasons.append(f"All critical layers passed ({passed_count} layers verified)")
        
        # Add warning if stubs exist
        if stub_count > 0:
            reasons.append(f"Note: {stub_count} security layers awaiting full implementation")
        
        return CommandDecision.ALLOW, reasons
    
    async def check_command_risk_level(self, command_name: str) -> Optional[RiskLevel]:
        """
        Check the risk level of a registered command
        
        Args:
            command_name: Name of the command
        
        Returns:
            Risk level or None if command not registered
        """
        command = await get_registered_command(self.db, command_name)
        
        if not command:
            return None
        
        return RiskLevel(command["risk_level"])
    
    async def is_command_protected(self, command_name: str) -> bool:
        """
        Check if a command is registered with FAP protection
        
        Args:
            command_name: Name of the command
        
        Returns:
            True if command is registered and protected
        """
        command = await get_registered_command(self.db, command_name)
        return command is not None
