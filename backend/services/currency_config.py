"""
BCEE v1.0 - Currency Configuration Service

Provides base currency, supported currencies, and country-to-currency mappings.
Configuration-driven for easy updates without code changes.
"""

from typing import Dict, List


class CurrencyConfigService:
    """
    Configuration service for BCEE currency system
    
    All monetary values in BANIBS are stored in USD.
    This service provides mappings for display purposes only.
    """
    
    # Base currency for all BANIBS accounting
    BASE_CURRENCY = "USD"
    
    # Supported currencies for display
    # Format: [currency_code, symbol, decimal_places]
    SUPPORTED_CURRENCIES = {
        "USD": {"symbol": "$", "decimals": 2, "name": "US Dollar"},
        "NGN": {"symbol": "₦", "decimals": 2, "name": "Nigerian Naira"},
        "GHS": {"symbol": "₵", "decimals": 2, "name": "Ghanaian Cedi"},
        "ZAR": {"symbol": "R", "decimals": 2, "name": "South African Rand"},
        "KES": {"symbol": "KSh", "decimals": 2, "name": "Kenyan Shilling"},
        "GBP": {"symbol": "£", "decimals": 2, "name": "British Pound"},
        "EUR": {"symbol": "€", "decimals": 2, "name": "Euro"},
        "CAD": {"symbol": "C$", "decimals": 2, "name": "Canadian Dollar"},
        "XOF": {"symbol": "CFA", "decimals": 0, "name": "West African CFA Franc"},
        "JMD": {"symbol": "J$", "decimals": 2, "name": "Jamaican Dollar"},
        "TTD": {"symbol": "TT$", "decimals": 2, "name": "Trinidad and Tobago Dollar"},
        "BBD": {"symbol": "Bds$", "decimals": 2, "name": "Barbadian Dollar"},
    }
    
    # Country code to default currency mapping
    # ISO 3166-1 alpha-2 country codes
    COUNTRY_TO_CURRENCY = {
        # Africa
        "NG": "NGN",  # Nigeria
        "GH": "GHS",  # Ghana
        "ZA": "ZAR",  # South Africa
        "KE": "KES",  # Kenya
        "SN": "XOF",  # Senegal
        "CI": "XOF",  # Côte d'Ivoire
        "ML": "XOF",  # Mali
        "BF": "XOF",  # Burkina Faso
        "BJ": "XOF",  # Benin
        "TG": "XOF",  # Togo
        "NE": "XOF",  # Niger
        "GW": "XOF",  # Guinea-Bissau
        
        # Caribbean
        "JM": "JMD",  # Jamaica
        "TT": "TTD",  # Trinidad and Tobago
        "BB": "BBD",  # Barbados
        
        # North America
        "US": "USD",  # United States
        "CA": "CAD",  # Canada
        
        # Europe
        "GB": "GBP",  # United Kingdom
        "FR": "EUR",  # France
        "DE": "EUR",  # Germany
        "ES": "EUR",  # Spain
        "IT": "EUR",  # Italy
        "NL": "EUR",  # Netherlands
        "BE": "EUR",  # Belgium
        "PT": "EUR",  # Portugal
        "IE": "EUR",  # Ireland
    }
    
    @classmethod
    def get_base_currency(cls) -> str:
        """
        Get the base currency for BANIBS accounting
        
        Returns:
            str: Base currency code (always "USD")
        """
        return cls.BASE_CURRENCY
    
    @classmethod
    def get_supported_currencies(cls) -> List[str]:
        """
        Get list of supported currency codes
        
        Returns:
            List[str]: List of ISO 4217 currency codes
        """
        return list(cls.SUPPORTED_CURRENCIES.keys())
    
    @classmethod
    def get_currency_info(cls, currency_code: str) -> Dict:
        """
        Get detailed information about a currency
        
        Args:
            currency_code: ISO 4217 currency code
        
        Returns:
            Dict with symbol, decimals, name
        """
        return cls.SUPPORTED_CURRENCIES.get(currency_code, {
            "symbol": currency_code,
            "decimals": 2,
            "name": currency_code
        })
    
    @classmethod
    def get_default_currency_for_country(cls, country_code: str) -> str:
        """
        Get default currency for a country
        
        Args:
            country_code: ISO 3166-1 alpha-2 country code
        
        Returns:
            str: Currency code, defaults to USD if country not mapped
        """
        return cls.COUNTRY_TO_CURRENCY.get(country_code.upper(), cls.BASE_CURRENCY)
    
    @classmethod
    def is_currency_supported(cls, currency_code: str) -> bool:
        """
        Check if a currency is supported
        
        Args:
            currency_code: Currency code to check
        
        Returns:
            bool: True if supported
        """
        return currency_code in cls.SUPPORTED_CURRENCIES
    
    @classmethod
    def format_money(cls, amount: float, currency_code: str) -> str:
        """
        Format money amount with currency symbol
        
        Args:
            amount: Monetary amount
            currency_code: Currency code
        
        Returns:
            str: Formatted money string (e.g. "$10.00", "₦14,500")
        """
        info = cls.get_currency_info(currency_code)
        symbol = info.get("symbol", currency_code)
        decimals = info.get("decimals", 2)
        
        if decimals == 0:
            # No decimals (e.g. CFA Franc)
            formatted = f"{symbol}{amount:,.0f}"
        else:
            # With decimals
            formatted = f"{symbol}{amount:,.{decimals}f}"
        
        return formatted
