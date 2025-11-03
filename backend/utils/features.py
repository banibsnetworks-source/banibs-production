"""
Feature Flags Loader - Phase 6.4
Load and access feature flags from config/features.json
"""

import json
import os
from typing import Any, Dict

# Default features if file is missing
DEFAULT_FEATURES = {
    "ui": {
        "sentimentBadges": True
    },
    "moderation": {
        "auto_from_sentiment": True,
        "block_negative": False,
        "threshold": -0.5
    }
}

_features_cache = None


def load_features() -> Dict[str, Any]:
    """
    Load features from config/features.json
    Returns default values if file doesn't exist or can't be parsed
    """
    global _features_cache
    
    # Return cached if available
    if _features_cache is not None:
        return _features_cache
    
    features_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "config",
        "features.json"
    )
    
    try:
        with open(features_path, "r") as f:
            _features_cache = json.load(f)
            return _features_cache
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load features.json, using defaults. Error: {e}")
        _features_cache = DEFAULT_FEATURES
        return _features_cache


def get_feature(key_path: str, default: Any = None) -> Any:
    """
    Get a feature value by dot-separated path
    
    Example:
        get_feature("moderation.threshold", -0.5)
        get_feature("ui.sentimentBadges", True)
    """
    features = load_features()
    keys = key_path.split(".")
    
    value = features
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return default
    
    return value


def is_feature_enabled(key_path: str) -> bool:
    """
    Check if a feature is enabled (convenience method for boolean features)
    """
    return bool(get_feature(key_path, False))
