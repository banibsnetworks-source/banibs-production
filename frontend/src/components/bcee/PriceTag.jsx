/**
 * BCEE v1.0 - PriceTag Component
 * 
 * Displays prices with multi-currency support.
 * Shows local currency (primary) and USD (secondary) based on user's region.
 * 
 * Usage:
 * <PriceTag usdAmount={12.99} />
 * <PriceTag usdAmount={50} size="lg" />
 * <PriceTag usdAmount={25.50} showUsdOnly={true} />
 */

import React, { useState, useEffect } from 'react';
import { getPriceDisplay } from '../../services/bceeApi';
import { useAuth } from '../../contexts/AuthContext';

const PriceTag = ({ 
  usdAmount, 
  size = 'md',
  className = '',
  showUsdOnly = false,
  targetCurrency = null
}) => {
  const { user } = useAuth();
  const [priceDisplay, setPriceDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchPriceDisplay() {
      // Skip API call if USD only mode
      if (showUsdOnly) {
        setPriceDisplay({
          base: { amount: usdAmount, currency: 'USD' },
          local: null,
          label: `$${Number(usdAmount).toFixed(2)}`,
          exchange_rate: null
        });
        setLoading(false);
        return;
      }

      try {
        // Get user token if authenticated
        const token = user ? localStorage.getItem('access_token') : null;
        
        const display = await getPriceDisplay(usdAmount, targetCurrency, token);
        
        if (isMounted) {
          setPriceDisplay(display);
          setError(false);
        }
      } catch (err) {
        console.error('PriceTag fetch error:', err);
        if (isMounted) {
          // Fallback to USD only on error
          setPriceDisplay({
            base: { amount: usdAmount, currency: 'USD' },
            local: null,
            label: `$${Number(usdAmount).toFixed(2)}`,
            exchange_rate: null
          });
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPriceDisplay();

    return () => {
      isMounted = false;
    };
  }, [usdAmount, showUsdOnly, targetCurrency, user]);

  // Size variants
  const sizeStyles = {
    sm: {
      primary: 'text-xs',
      secondary: 'text-[0.65rem]',
    },
    md: {
      primary: 'text-sm',
      secondary: 'text-xs',
    },
    lg: {
      primary: 'text-base font-semibold',
      secondary: 'text-sm',
    },
    xl: {
      primary: 'text-lg font-bold',
      secondary: 'text-base',
    },
  };

  const styles = sizeStyles[size] || sizeStyles.md;

  // Loading state
  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  // Error or no price display
  if (!priceDisplay) {
    return (
      <div className={`${styles.primary} text-red-400 ${className}`}>
        Price unavailable
      </div>
    );
  }

  const { base, local, label } = priceDisplay;

  // If no local conversion (USD user or API offline)
  if (!local || local.currency === 'USD') {
    return (
      <div className={`${styles.primary} text-amber-300 font-semibold ${className}`}>
        ${Number(base.amount).toFixed(2)}
      </div>
    );
  }

  // Multi-currency display: Local (primary) + USD (secondary)
  return (
    <div className={`inline-flex flex-col ${className}`}>
      {/* Local currency (primary) */}
      <div className={`${styles.primary} text-amber-300 font-semibold leading-tight`}>
        {formatCurrencyAmount(local.amount, local.currency)}
      </div>
      
      {/* USD (secondary) */}
      <div className={`${styles.secondary} text-slate-400 leading-tight`}>
        approx. ${Number(base.amount).toFixed(2)}
      </div>
    </div>
  );
};

/**
 * Format currency amount with proper symbol and decimals
 */
function formatCurrencyAmount(amount, currencyCode) {
  // Currency symbols map
  const symbols = {
    'USD': '$',
    'NGN': '₦',
    'GHS': '₵',
    'ZAR': 'R',
    'KES': 'KSh',
    'GBP': '£',
    'EUR': '€',
    'CAD': 'C$',
    'XOF': 'CFA',
    'JMD': 'J$',
    'TTD': 'TT$',
    'BBD': 'Bds$',
  };

  const symbol = symbols[currencyCode] || currencyCode;
  
  // Format with thousands separators
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

export default PriceTag;
