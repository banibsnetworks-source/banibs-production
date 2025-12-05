"""
BCEE v1.0 - Payment Provider Service (Abstraction Layer)

Defines provider-agnostic interface for payment processing.
Enables plug-and-play integration of multiple payment providers (Stripe, PayPal, etc.)

NOTE: This is an ABSTRACTION ONLY. Concrete provider implementations
      (StripeProvider, PayPalProvider) will be added in future phases.
"""

from abc import ABC, abstractmethod
from typing import Dict, Optional
from datetime import datetime

from models.currency import PaymentSession


class PaymentProvider(ABC):
    """
    Abstract base class for payment providers
    
    All payment providers must implement this interface to ensure
    consistent behavior across different payment gateways.
    """
    
    @abstractmethod
    async def create_checkout_session(
        self,
        amount: float,
        currency: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict] = None
    ) -> PaymentSession:
        """
        Create a checkout session
        
        Args:
            amount: Amount to charge in base currency units
            currency: Currency code (ISO 4217)
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            metadata: Optional metadata to attach to payment
        
        Returns:
            PaymentSession with checkout URL and session ID
        
        Raises:
            PaymentProviderError: If session creation fails
        """
        pass
    
    @abstractmethod
    async def verify_payment(
        self,
        session_id: str
    ) -> Dict:
        """
        Verify payment status and retrieve details
        
        Args:
            session_id: Payment session ID from provider
        
        Returns:
            Dict with payment details:
            {
                "status": "completed" | "pending" | "failed" | "cancelled",
                "amount": float,
                "currency": str,
                "payment_intent_id": str,
                "metadata": dict
            }
        
        Raises:
            PaymentProviderError: If verification fails
        """
        pass
    
    @abstractmethod
    async def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None
    ) -> Dict:
        """
        Refund a payment (full or partial)
        
        Args:
            payment_intent_id: Payment intent/transaction ID
            amount: Optional partial refund amount (None = full refund)
        
        Returns:
            Dict with refund details:
            {
                "refund_id": str,
                "amount": float,
                "status": "succeeded" | "pending" | "failed"
            }
        
        Raises:
            PaymentProviderError: If refund fails
        """
        pass
    
    @abstractmethod
    async def get_supported_currencies(self) -> list[str]:
        """
        Get list of currencies supported by this provider
        
        Returns:
            List of ISO 4217 currency codes
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Get provider name identifier
        
        Returns:
            str: Provider name (e.g. "stripe", "paypal")
        """
        pass


class PaymentProviderError(Exception):
    """
    Custom exception for payment provider errors
    """
    def __init__(self, message: str, provider: str, error_code: Optional[str] = None):
        self.message = message
        self.provider = provider
        self.error_code = error_code
        super().__init__(self.message)


class PaymentProviderFactory:
    """
    Factory for creating payment provider instances
    
    Allows runtime selection of payment providers based on:
    - Currency support
    - User region
    - Provider availability
    """
    
    _providers: Dict[str, PaymentProvider] = {}
    
    @classmethod
    def register_provider(cls, name: str, provider: PaymentProvider) -> None:
        """
        Register a payment provider
        
        Args:
            name: Provider identifier (e.g. "stripe")
            provider: Provider instance implementing PaymentProvider
        """
        cls._providers[name] = provider
    
    @classmethod
    def get_provider(cls, name: str) -> Optional[PaymentProvider]:
        """
        Get a registered payment provider
        
        Args:
            name: Provider identifier
        
        Returns:
            PaymentProvider instance or None if not found
        """
        return cls._providers.get(name)
    
    @classmethod
    def get_available_providers(cls) -> list[str]:
        """
        Get list of registered provider names
        
        Returns:
            List of provider identifiers
        """
        return list(cls._providers.keys())
    
    @classmethod
    async def get_provider_for_currency(cls, currency: str) -> Optional[PaymentProvider]:
        """
        Get the best provider for a specific currency
        
        Args:
            currency: ISO 4217 currency code
        
        Returns:
            PaymentProvider instance or None if no provider supports currency
        """
        for provider in cls._providers.values():
            supported = await provider.get_supported_currencies()
            if currency in supported:
                return provider
        return None


# Future provider implementations will extend PaymentProvider:
# 
# class StripeProvider(PaymentProvider):
#     async def create_checkout_session(self, ...):
#         # Stripe-specific implementation
#         ...
# 
# class PayPalProvider(PaymentProvider):
#     async def create_checkout_session(self, ...):
#         # PayPal-specific implementation
#         ...
