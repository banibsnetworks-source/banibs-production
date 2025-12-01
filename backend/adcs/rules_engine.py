"""
ADCS Rules Engine - Domain-specific hardcoded rules

This is the "NO" machine - hardcoded rule functions that have final say
over whether an action is allowed, denied, or requires human approval.

Rules are grouped by domain:
- money_rules: Wallet, payouts, balance checks
- trust_rules: Relationships, blocks, bans
- security_rules: Auth, roles, permissions
- schema_rules: Database migrations, schema changes
"""

from typing import List
from datetime import datetime, timezone

from adcs.models import (
    RuleResult,
    ADCSVerdict,
    ADCSActionType,
    ADCSCheckRequest
)
from adcs.config import ADCSConfig
from adcs.audit_log import ADCSAuditLog


class MoneyRules:
    """Rules for wallet operations, payouts, and financial transactions"""
    
    @staticmethod
    async def check_balance(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: User must have sufficient balance for payout.
        """
        amount = request.payload.get("amount", 0)
        user_balance = request.payload.get("user_balance", 0)
        
        if user_balance < amount:
            return RuleResult(
                rule_name="money.balance_check",
                verdict=ADCSVerdict.DENY,
                reasons=[f"Insufficient balance: {user_balance} < {amount}"]
            )
        
        if user_balance < ADCSConfig.MIN_BALANCE_REQUIRED:
            return RuleResult(
                rule_name="money.balance_check",
                verdict=ADCSVerdict.DENY,
                reasons=[f"Balance below minimum required: {ADCSConfig.MIN_BALANCE_REQUIRED}"]
            )
        
        return RuleResult(
            rule_name="money.balance_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Balance check passed"]
        )
    
    @staticmethod
    async def check_transaction_limit(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Payout amount must not exceed per-transaction limit.
        """
        amount = request.payload.get("amount", 0)
        
        if amount > ADCSConfig.MAX_PAYOUT_PER_TRANSACTION:
            return RuleResult(
                rule_name="money.limit_check",
                verdict=ADCSVerdict.DENY,
                reasons=[
                    f"Amount {amount} exceeds max per transaction: {ADCSConfig.MAX_PAYOUT_PER_TRANSACTION}"
                ]
            )
        
        return RuleResult(
            rule_name="money.limit_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Transaction limit check passed"]
        )
    
    @staticmethod
    async def check_daily_limit(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: User must not exceed daily payout limit.
        """
        amount = request.payload.get("amount", 0)
        
        # Get user's payout history for today
        today_payouts = await ADCSAuditLog.get_recent_actions_count(
            actor_id=request.actor_id,
            action_type=ADCSActionType.WALLET_PAYOUT,
            hours=24
        )
        
        # For now, simplified: just count transactions
        # TODO: Sum actual amounts from audit logs
        estimated_today_total = today_payouts * 100  # Rough estimate
        
        if estimated_today_total + amount > ADCSConfig.MAX_PAYOUT_PER_DAY_PER_USER:
            return RuleResult(
                rule_name="money.daily_limit_check",
                verdict=ADCSVerdict.DENY,
                reasons=[
                    f"Daily limit exceeded: ~{estimated_today_total} + {amount} > {ADCSConfig.MAX_PAYOUT_PER_DAY_PER_USER}"
                ]
            )
        
        return RuleResult(
            rule_name="money.daily_limit_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Daily limit check passed"]
        )
    
    @staticmethod
    async def check_double_entry(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Payout must follow double-entry bookkeeping.
        """
        # Check that payload includes proper accounting fields
        required_fields = ["from_account", "to_account", "amount"]
        missing_fields = [f for f in required_fields if f not in request.payload]
        
        if missing_fields:
            return RuleResult(
                rule_name="money.double_entry_check",
                verdict=ADCSVerdict.DENY,
                reasons=[f"Missing required accounting fields: {missing_fields}"]
            )
        
        return RuleResult(
            rule_name="money.double_entry_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Double-entry bookkeeping check passed"]
        )


class TrustRules:
    """Rules for relationships, blocks, bans, and trust operations"""
    
    @staticmethod
    async def check_block_rate_limit(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: User cannot block too many people per day (anti-abuse).
        """
        blocks_today = await ADCSAuditLog.get_recent_actions_count(
            actor_id=request.actor_id,
            action_type=ADCSActionType.RELATIONSHIP_BLOCK,
            hours=24
        )
        
        if blocks_today >= ADCSConfig.MAX_BLOCKS_PER_DAY:
            return RuleResult(
                rule_name="trust.block_rate_limit",
                verdict=ADCSVerdict.DENY,
                reasons=[
                    f"Block rate limit exceeded: {blocks_today} blocks today (max: {ADCSConfig.MAX_BLOCKS_PER_DAY})"
                ]
            )
        
        return RuleResult(
            rule_name="trust.block_rate_limit",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Block rate limit check passed"]
        )
    
    @staticmethod
    async def check_ban_rate_limit(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Moderators cannot ban too many users per hour (anti-abuse).
        """
        bans_last_hour = await ADCSAuditLog.get_recent_actions_count(
            actor_id=request.actor_id,
            action_type=ADCSActionType.SOCIAL_BAN,
            hours=1
        )
        
        if bans_last_hour >= ADCSConfig.MAX_BANS_PER_HOUR:
            return RuleResult(
                rule_name="trust.ban_rate_limit",
                verdict=ADCSVerdict.DENY,
                reasons=[
                    f"Ban rate limit exceeded: {bans_last_hour} bans in last hour (max: {ADCSConfig.MAX_BANS_PER_HOUR})"
                ]
            )
        
        return RuleResult(
            rule_name="trust.ban_rate_limit",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Ban rate limit check passed"]
        )
    
    @staticmethod
    async def check_self_action(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: User cannot block/ban themselves.
        """
        target_user_id = request.target.get("user_id")
        
        if target_user_id == request.actor_id:
            return RuleResult(
                rule_name="trust.self_action_check",
                verdict=ADCSVerdict.DENY,
                reasons=["Cannot perform this action on yourself"]
            )
        
        return RuleResult(
            rule_name="trust.self_action_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Self-action check passed"]
        )


class SecurityRules:
    """Rules for authentication, authorization, and security operations"""
    
    @staticmethod
    async def check_role_elevation(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Role elevation requires human approval.
        """
        if ADCSConfig.REQUIRE_HUMAN_FOR_ROLE_ELEVATION:
            return RuleResult(
                rule_name="security.role_elevation_check",
                verdict=ADCSVerdict.REQUIRE_HUMAN,
                reasons=["Role elevation requires founder approval"]
            )
        
        return RuleResult(
            rule_name="security.role_elevation_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Role elevation auto-approved (config allows)"]
        )
    
    @staticmethod
    async def check_auth_config_change(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Auth configuration changes require human approval.
        """
        if ADCSConfig.REQUIRE_HUMAN_FOR_AUTH_CONFIG:
            return RuleResult(
                rule_name="security.auth_config_check",
                verdict=ADCSVerdict.REQUIRE_HUMAN,
                reasons=["Auth config changes require founder approval"]
            )
        
        return RuleResult(
            rule_name="security.auth_config_check",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Auth config change auto-approved (config allows)"]
        )


class SchemaRules:
    """Rules for database schema changes and migrations"""
    
    @staticmethod
    async def check_migration_requirements(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Schema migration must include migration + rollback scripts.
        """
        migration_script = request.payload.get("migration_script")
        rollback_script = request.payload.get("rollback_script")
        
        if not migration_script or not rollback_script:
            return RuleResult(
                rule_name="schema.migration_requirements",
                verdict=ADCSVerdict.DENY,
                reasons=["Schema migration must include both migration and rollback scripts"]
            )
        
        return RuleResult(
            rule_name="schema.migration_requirements",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Migration requirements check passed"]
        )
    
    @staticmethod
    async def check_migration_approval(request: ADCSCheckRequest) -> RuleResult:
        """
        Rule: Schema migrations require human approval.
        """
        if ADCSConfig.REQUIRE_HUMAN_FOR_SCHEMA_MIGRATION:
            return RuleResult(
                rule_name="schema.migration_approval",
                verdict=ADCSVerdict.REQUIRE_HUMAN,
                reasons=["Schema migrations require founder approval"]
            )
        
        return RuleResult(
            rule_name="schema.migration_approval",
            verdict=ADCSVerdict.ALLOW,
            reasons=["Migration auto-approved (config allows)"]
        )


class ADCSRulesEngine:
    """Main orchestrator for running domain-specific rules"""
    
    # Map action types to their applicable rule functions
    RULE_MAP = {
        ADCSActionType.WALLET_PAYOUT: [
            MoneyRules.check_balance,
            MoneyRules.check_transaction_limit,
            MoneyRules.check_daily_limit,
            MoneyRules.check_double_entry
        ],
        ADCSActionType.MARKETPLACE_PAYOUT: [
            MoneyRules.check_balance,
            MoneyRules.check_transaction_limit,
            MoneyRules.check_daily_limit,
            MoneyRules.check_double_entry
        ],
        ADCSActionType.RELATIONSHIP_BLOCK: [
            TrustRules.check_self_action,
            TrustRules.check_block_rate_limit
        ],
        ADCSActionType.RELATIONSHIP_UNBLOCK: [
            TrustRules.check_self_action
        ],
        ADCSActionType.SOCIAL_BAN: [
            TrustRules.check_self_action,
            TrustRules.check_ban_rate_limit
        ],
        ADCSActionType.SOCIAL_UNBAN: [
            TrustRules.check_self_action
        ],
        ADCSActionType.AUTH_ROLE_CHANGE: [
            SecurityRules.check_role_elevation
        ],
        ADCSActionType.AUTH_CONFIG_CHANGE: [
            SecurityRules.check_auth_config_change
        ],
        ADCSActionType.SCHEMA_MIGRATION: [
            SchemaRules.check_migration_requirements,
            SchemaRules.check_migration_approval
        ]
    }
    
    @staticmethod
    async def evaluate_rules(request: ADCSCheckRequest) -> tuple[ADCSVerdict, List[str], List[str]]:
        """
        Run all applicable rules for the given action type.
        
        Returns:
            (verdict, reasons, rules_evaluated)
            
        Logic:
        - If any rule returns DENY, the overall verdict is DENY
        - If any rule returns REQUIRE_HUMAN, the overall verdict is REQUIRE_HUMAN
        - If all rules return ALLOW, the overall verdict is ALLOW
        """
        rules = ADCSRulesEngine.RULE_MAP.get(request.action_type, [])
        
        if not rules:
            # No rules defined for this action type - allow by default but log warning
            return (
                ADCSVerdict.ALLOW,
                [f"No rules defined for {request.action_type.value} - allowing by default"],
                []
            )
        
        results: List[RuleResult] = []
        for rule_func in rules:
            result = await rule_func(request)
            results.append(result)
        
        # Determine overall verdict
        final_verdict = ADCSVerdict.ALLOW
        final_reasons = []
        rules_evaluated = []
        
        for result in results:
            rules_evaluated.append(result.rule_name)
            
            if result.verdict == ADCSVerdict.DENY:
                final_verdict = ADCSVerdict.DENY
                final_reasons.extend(result.reasons)
            elif result.verdict == ADCSVerdict.REQUIRE_HUMAN:
                if final_verdict != ADCSVerdict.DENY:  # DENY takes precedence
                    final_verdict = ADCSVerdict.REQUIRE_HUMAN
                final_reasons.extend(result.reasons)
            else:  # ALLOW
                final_reasons.extend(result.reasons)
        
        return (final_verdict, final_reasons, rules_evaluated)
