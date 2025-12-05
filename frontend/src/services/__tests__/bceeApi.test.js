/**
 * BCEE v1.0 Phase 5 - BCEE API Service Tests
 * 
 * Tests frontend API service for BCEE endpoints.
 */

import {
  getPriceDisplay,
  getBatchPriceDisplay,
  getUserRegion,
  updateUserRegion,
  getSupportedCurrencies,
  getExchangeRates,
} from '../bceeApi';

global.fetch = jest.fn();

describe('BCEE API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getPriceDisplay', () => {
    it('should fetch price display successfully', async () => {
      const mockResponse = {
        base: { amount: 10.0, currency: 'USD' },
        local: { amount: 14500, currency: 'NGN' },
        label: '$10.00 (approx. ₦14,500)',
        exchange_rate: 1450.0,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getPriceDisplay(10.0);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bcee/price-display?amount=10'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include target currency in request when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await getPriceDisplay(25.0, 'GBP');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('target_currency=GBP'),
        expect.any(Object)
      );
    });

    it('should include auth token when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await getPriceDisplay(15.0, null, 'test_token_123');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_token_123',
          }),
        })
      );
    });

    it('should return USD fallback on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getPriceDisplay(20.0);

      expect(result).toEqual({
        base: { amount: 20.0, currency: 'USD' },
        local: null,
        label: '$20.00',
        exchange_rate: null,
      });
    });
  });

  describe('getBatchPriceDisplay', () => {
    it('should fetch batch prices successfully', async () => {
      const mockResponse = {
        prices: [
          {
            base: { amount: 10.0, currency: 'USD' },
            local: { amount: 14500, currency: 'NGN' },
            label: '$10.00 (approx. ₦14,500)',
            exchange_rate: 1450.0,
          },
          {
            base: { amount: 25.0, currency: 'USD' },
            local: { amount: 36250, currency: 'NGN' },
            label: '$25.00 (approx. ₦36,250)',
            exchange_rate: 1450.0,
          },
        ],
        target_currency: 'NGN',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getBatchPriceDisplay([10.0, 25.0]);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bcee/price-display/batch'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amounts: [10.0, 25.0],
            target_currency: null,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return USD fallback for batch on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getBatchPriceDisplay([5.0, 15.0]);

      expect(result.prices).toHaveLength(2);
      expect(result.prices[0]).toEqual({
        base: { amount: 5.0, currency: 'USD' },
        local: null,
        label: '$5.00',
        exchange_rate: null,
      });
      expect(result.target_currency).toBe('USD');
    });
  });

  describe('getUserRegion', () => {
    it('should fetch user region successfully', async () => {
      const mockResponse = {
        country_code: 'NG',
        preferred_currency: 'NGN',
        locale: 'en-NG',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getUserRegion('test_token');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bcee/user-region'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_token',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await getUserRegion('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('updateUserRegion', () => {
    it('should update user region successfully', async () => {
      const mockResponse = {
        country_code: 'GB',
        preferred_currency: 'GBP',
        locale: 'en-GB',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateUserRegion('GB', 'GBP', 'test_token');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bcee/update-region'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            country_code: 'GB',
            preferred_currency: 'GBP',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed update', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(updateUserRegion('INVALID', null, 'test_token'))
        .rejects.toThrow();
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should fetch supported currencies successfully', async () => {
      const mockResponse = {
        base_currency: 'USD',
        supported_currencies: [
          { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
          { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
        ],
        total_count: 2,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getSupportedCurrencies();

      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getSupportedCurrencies();

      expect(result).toBeNull();
    });
  });

  describe('getExchangeRates', () => {
    it('should fetch exchange rates successfully', async () => {
      const mockResponse = {
        base_currency: 'USD',
        rates: {
          'USD': 1.0,
          'NGN': 1450.0,
          'GBP': 0.79,
        },
        source: 'dev',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getExchangeRates();

      expect(result).toEqual(mockResponse);
    });
  });
});
