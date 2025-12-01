"""
ADCS Decorators - Endpoint protection

Provides the @adcs_guard decorator for protecting critical endpoints.
"""

from functools import wraps
from typing import Callable, Any
from fastapi import HTTPException, Request
import inspect

from adcs.models import ADCSActionType, ADCSRiskLevel, ADCSVerdict
from adcs.services import run_adcs_check


def adcs_guard(
    action_type: ADCSActionType,
    risk_level: ADCSRiskLevel,
    extract_actor: Callable[[Any], str] = None,
    extract_target: Callable[[Any], dict] = None,
    extract_payload: Callable[[Any], dict] = None
):
    """
    Decorator for protecting endpoints with ADCS.
    
    Usage:
    ```python
    @router.post("/wallet/payout")
    @adcs_guard(
        action_type=ADCSActionType.WALLET_PAYOUT,
        risk_level=ADCSRiskLevel.P0
    )
    async def payout(request: PayoutRequest, current_user: dict = Depends(get_current_user)):
        # ... endpoint logic
        pass
    ```
    
    The decorator will:
    1. Extract actor_id, target, and payload from the request
    2. Run ADCS evaluation
    3. If ALLOW: proceed with endpoint
    4. If DENY: raise HTTPException with 403
    5. If REQUIRE_HUMAN: raise HTTPException with 202 (Accepted) and provide pending info
    
    Args:
        action_type: Type of action being guarded
        risk_level: Risk level (P0, P1, P2)
        extract_actor: Optional function to extract actor_id from request
        extract_target: Optional function to extract target dict from request
        extract_payload: Optional function to extract payload dict from request
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Try to extract current_user from kwargs (FastAPI dependency)
            current_user = kwargs.get('current_user')
            
            # Default actor extraction
            if extract_actor:
                actor_id = extract_actor(*args, **kwargs)
            elif current_user:
                actor_id = current_user.get('id', 'unknown')
            else:
                actor_id = 'system'
            
            # Default target extraction
            if extract_target:
                target = extract_target(*args, **kwargs)
            else:
                # Try to extract from first positional arg if it's a Pydantic model
                target = {}
                if args and hasattr(args[0], 'model_dump'):
                    target = args[0].model_dump()
                elif args and hasattr(args[0], 'dict'):
                    target = args[0].dict()
            
            # Default payload extraction
            if extract_payload:
                payload = extract_payload(*args, **kwargs)
            else:
                # Try to extract from first positional arg
                payload = {}
                if args and hasattr(args[0], 'model_dump'):
                    payload = args[0].model_dump()
                elif args and hasattr(args[0], 'dict'):
                    payload = args[0].dict()
                
                # Add user balance if available (for money operations)
                if current_user and 'balance' in current_user:
                    payload['user_balance'] = current_user.get('balance', 0)
            
            # Run ADCS check
            result = await run_adcs_check(
                action_type=action_type,
                risk_level=risk_level,
                actor_type='human' if current_user else 'system',
                actor_id=actor_id,
                target=target,
                payload=payload,
                metadata={
                    'endpoint': func.__name__,
                    'module': func.__module__
                }
            )
            
            # Handle verdict
            if result.verdict == ADCSVerdict.DENY:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "Action denied by ADCS",
                        "reasons": result.reasons,
                        "request_id": result.request_id
                    }
                )
            
            elif result.verdict == ADCSVerdict.REQUIRE_HUMAN:
                raise HTTPException(
                    status_code=202,  # Accepted
                    detail={
                        "status": "pending_approval",
                        "message": "Action requires founder approval",
                        "reasons": result.reasons,
                        "request_id": result.request_id,
                        "note": "Your request has been logged and is awaiting approval. You will be notified when it's processed."
                    }
                )
            
            # ALLOW - proceed with original function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def adcs_internal_guard(
    action_type: ADCSActionType,
    risk_level: ADCSRiskLevel,
    actor_id: str,
    target: dict,
    payload: dict,
    metadata: dict = None
):
    """
    Function wrapper for internal (non-HTTP) critical actions.
    
    Use this for things like schema migrations, internal system operations.
    
    Usage:
    ```python
    result = await adcs_internal_guard(
        action_type=ADCSActionType.SCHEMA_MIGRATION,
        risk_level=ADCSRiskLevel.P1,
        actor_id="system",
        target={"schema": "users"},
        payload={"migration_script": "...", "rollback_script": "..."}
    )
    
    if result.verdict == ADCSVerdict.ALLOW:
        # Execute migration
        pass
    else:
        # Handle denial or pending approval
        pass
    ```
    
    Returns:
        ADCSCheckResult
    """
    return run_adcs_check(
        action_type=action_type,
        risk_level=risk_level,
        actor_type='system',
        actor_id=actor_id,
        target=target,
        payload=payload,
        metadata=metadata
    )
