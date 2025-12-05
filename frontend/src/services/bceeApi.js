/**
 * BCEE v1.0 - Frontend API Service
 * 
 * Handles all API calls to BANIBS Currency & Exchange Engine endpoints.
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Get price display with currency conversion
 * 
 * @param {number} amount - Amount in USD
 * @param {string} targetCurrency - Optional target currency override
 * @param {string} token - Optional JWT token for authenticated requests
 * @returns {Promise<Object>} PriceDisplay object
 */
export async function getPriceDisplay(amount, targetCurrency = null, token = null) {
  try {
    const params = new URLSearchParams({ amount: amount.toString() });
    if (targetCurrency) {
      params.append('target_currency', targetCurrency);
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/bcee/price-display?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`BCEE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BCEE getPriceDisplay error:', error);
    // Return fallback USD-only display
    return {
      base: { amount, currency: 'USD' },
      local: null,
      label: `$${amount.toFixed(2)}`,
      exchange_rate: null,
    };
  }
}

/**
 * Get batch price displays
 * 
 * @param {number[]} amounts - Array of amounts in USD
 * @param {string} targetCurrency - Optional target currency override
 * @param {string} token - Optional JWT token
 * @returns {Promise<Object>} BatchPriceResponse with prices array
 */
export async function getBatchPriceDisplay(amounts, targetCurrency = null, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/bcee/price-display/batch`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amounts,
          target_currency: targetCurrency,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`BCEE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BCEE getBatchPriceDisplay error:', error);
    // Return fallback USD-only displays
    return {
      prices: amounts.map(amount => ({
        base: { amount, currency: 'USD' },
        local: null,
        label: `$${amount.toFixed(2)}`,
        exchange_rate: null,
      })),
      target_currency: 'USD',
    };
  }
}

/**
 * Get user's region and currency preferences
 * 
 * @param {string} token - JWT token (required)
 * @returns {Promise<Object>} UserRegionProfile
 */
export async function getUserRegion(token) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/bcee/user-region`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`BCEE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BCEE getUserRegion error:', error);
    return null;
  }
}

/**
 * Update user's region preferences
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @param {string} preferredCurrency - Optional currency override
 * @param {string} token - JWT token (required)
 * @returns {Promise<Object>} Updated UserRegionProfile
 */
export async function updateUserRegion(countryCode, preferredCurrency = null, token) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/bcee/update-region`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country_code: countryCode,
          preferred_currency: preferredCurrency,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`BCEE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BCEE updateUserRegion error:', error);
    throw error;
  }
}

/**
 * Get list of supported currencies
 * 
 * @returns {Promise<Object>} SupportedCurrenciesResponse
 */
export async function getSupportedCurrencies() {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/bcee/supported-currencies`
    );

    if (!response.ok) {
      throw new Error(`BCEE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BCEE getSupportedCurrencies error:', error);
    return null;
  }
}

/**
 * Get current exchange rates
 * 
 * @returns {Promise<Object>} ExchangeRatesResponse
 */
export async function getExchangeRates() {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/bcee/exchange-rates`
    );

    if (!response.ok) {
      throw new Error(`BCEE API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('BCEE getExchangeRates error:', error);
    return null;
  }
}
