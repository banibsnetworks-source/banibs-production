"""
ADCS Configuration - Thresholds and limits

These values should eventually be moved to environment variables
or a configuration management system.
"""

import os
from typing import Dict, Any


class ADCSConfig:
    """Central configuration for ADCS rules and thresholds"""
    
    # Money / Wallet Limits
    MAX_PAYOUT_PER_TRANSACTION = float(os.getenv("ADCS_MAX_PAYOUT_PER_TX", "1000"))  # BANIBS credits
    MAX_PAYOUT_PER_DAY_PER_USER = float(os.getenv("ADCS_MAX_PAYOUT_PER_DAY", "5000"))  # BANIBS credits
    MAX_PAYOUT_PER_MONTH_PER_USER = float(os.getenv("ADCS_MAX_PAYOUT_PER_MONTH", "20000"))  # BANIBS credits
    MIN_BALANCE_REQUIRED = float(os.getenv("ADCS_MIN_BALANCE", "0"))  # Must have positive balance
    
    # Trust / Relationship Limits
    MAX_BLOCKS_PER_DAY = int(os.getenv("ADCS_MAX_BLOCKS_PER_DAY", "20"))  # Anti-abuse
    MAX_BANS_PER_HOUR = int(os.getenv("ADCS_MAX_BANS_PER_HOUR", "10"))  # Anti-abuse for moderators
    
    # Security
    REQUIRE_HUMAN_FOR_ROLE_ELEVATION = os.getenv("ADCS_REQUIRE_HUMAN_ROLE_CHANGE", "true").lower() == "true"
    REQUIRE_HUMAN_FOR_AUTH_CONFIG = os.getenv("ADCS_REQUIRE_HUMAN_AUTH_CONFIG", "true").lower() == "true"
    
    # Schema
    REQUIRE_HUMAN_FOR_SCHEMA_MIGRATION = os.getenv("ADCS_REQUIRE_HUMAN_SCHEMA", "true").lower() == "true"
    
    @classmethod
    def get_all_config(cls) -> Dict[str, Any]:
        """Get all configuration as dictionary"""
        return {
            "MAX_PAYOUT_PER_TRANSACTION": cls.MAX_PAYOUT_PER_TRANSACTION,
            "MAX_PAYOUT_PER_DAY_PER_USER": cls.MAX_PAYOUT_PER_DAY_PER_USER,
            "MAX_PAYOUT_PER_MONTH_PER_USER": cls.MAX_PAYOUT_PER_MONTH_PER_USER,
            "MIN_BALANCE_REQUIRED": cls.MIN_BALANCE_REQUIRED,
            "MAX_BLOCKS_PER_DAY": cls.MAX_BLOCKS_PER_DAY,
            "MAX_BANS_PER_HOUR": cls.MAX_BANS_PER_HOUR,
            "REQUIRE_HUMAN_FOR_ROLE_ELEVATION": cls.REQUIRE_HUMAN_FOR_ROLE_ELEVATION,
            "REQUIRE_HUMAN_FOR_AUTH_CONFIG": cls.REQUIRE_HUMAN_FOR_AUTH_CONFIG,
            "REQUIRE_HUMAN_FOR_SCHEMA_MIGRATION": cls.REQUIRE_HUMAN_FOR_SCHEMA_MIGRATION
        }
