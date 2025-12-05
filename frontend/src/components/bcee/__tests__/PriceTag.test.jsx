/**
 * BCEE v1.0 Phase 5 - PriceTag Component Tests
 * 
 * Tests multi-currency price display component for:
 * - Correct rendering of different currencies
 * - Fallback behavior
 * - Loading states
 * - Error handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PriceTag from '../PriceTag';
import * as bceeApi from '../../../services/bceeApi';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock the BCEE API
jest.mock('../../../services/bceeApi');

// Mock AuthContext
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
};

const MockAuthProvider = ({ children, value = mockAuthContext }) => (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

describe('PriceTag Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('USD Region (Default)', () => {
    it('should display USD-only format for US users', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 12.00, currency: 'USD' },
        local: null,
        label: '$12.00',
        exchange_rate: null,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={12.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('$12.00')).toBeInTheDocument();
      });

      // Should NOT show "approx." text for USD-only
      expect(screen.queryByText(/approx\./)).not.toBeInTheDocument();
    });

    it('should format USD amounts with 2 decimal places', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 9.99, currency: 'USD' },
        local: null,
        label: '$9.99',
        exchange_rate: null,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={9.99} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('$9.99')).toBeInTheDocument();
      });
    });
  });

  describe('Nigeria Region (NGN)', () => {
    it('should display multi-currency format for Nigerian users', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 12.00, currency: 'USD' },
        local: { amount: 17400, currency: 'NGN' },
        label: '$12.00 (approx. ₦17,400)',
        exchange_rate: 1450.0,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={12.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        // Primary: NGN amount
        expect(screen.getByText('₦17,400')).toBeInTheDocument();
        // Secondary: USD approximation
        expect(screen.getByText(/approx\. \$12\.00/)).toBeInTheDocument();
      });
    });

    it('should format NGN with thousands separator', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 50.00, currency: 'USD' },
        local: { amount: 72500, currency: 'NGN' },
        label: '$50.00 (approx. ₦72,500)',
        exchange_rate: 1450.0,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={50.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('₦72,500')).toBeInTheDocument();
      });
    });
  });

  describe('UK Region (GBP)', () => {
    it('should display GBP for UK users', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 12.00, currency: 'USD' },
        local: { amount: 9.48, currency: 'GBP' },
        label: '$12.00 (approx. £9.48)',
        exchange_rate: 0.79,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={12.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('£9.48')).toBeInTheDocument();
        expect(screen.getByText(/approx\. \$12\.00/)).toBeInTheDocument();
      });
    });
  });

  describe('Ghana Region (GHS)', () => {
    it('should display GHS for Ghanaian users', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 12.00, currency: 'USD' },
        local: { amount: 150.00, currency: 'GHS' },
        label: '$12.00 (approx. ₵150.00)',
        exchange_rate: 12.5,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={12.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('₵150')).toBeInTheDocument();
        expect(screen.getByText(/approx\. \$12\.00/)).toBeInTheDocument();
      });
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to USD when API fails', async () => {
      bceeApi.getPriceDisplay.mockRejectedValue(new Error('API Error'));

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={25.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('$25.00')).toBeInTheDocument();
      });

      // Should not crash or show error message
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should show USD-only when showUsdOnly prop is true', async () => {
      // Should not call API when showUsdOnly is true
      render(
        <MockAuthProvider>
          <PriceTag usdAmount={15.00} showUsdOnly={true} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('$15.00')).toBeInTheDocument();
      });

      // API should not have been called
      expect(bceeApi.getPriceDisplay).not.toHaveBeenCalled();
    });

    it('should handle unauthenticated users gracefully', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 10.00, currency: 'USD' },
        local: null,
        label: '$10.00',
        exchange_rate: null,
      });

      render(
        <MockAuthProvider value={{ user: null, isAuthenticated: false }}>
          <PriceTag usdAmount={10.00} />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('$10.00')).toBeInTheDocument();
      });

      // Should call API without token
      expect(bceeApi.getPriceDisplay).toHaveBeenCalledWith(10.00, null, null);
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton initially', () => {
      bceeApi.getPriceDisplay.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          base: { amount: 5.00, currency: 'USD' },
          local: null,
          label: '$5.00',
          exchange_rate: null,
        }), 100))
      );

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={5.00} />
        </MockAuthProvider>
      );

      // Should show loading skeleton
      expect(screen.getByRole('status', { hidden: true }) || document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 5.00, currency: 'USD' },
        local: null,
        label: '$5.00',
        exchange_rate: null,
      });

      const { container } = render(
        <MockAuthProvider>
          <PriceTag usdAmount={5.00} size="sm" />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const priceElement = container.querySelector('.text-xs');
        expect(priceElement).toBeInTheDocument();
      });
    });

    it('should apply extra large size classes', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 100.00, currency: 'USD' },
        local: null,
        label: '$100.00',
        exchange_rate: null,
      });

      const { container } = render(
        <MockAuthProvider>
          <PriceTag usdAmount={100.00} size="xl" />
        </MockAuthProvider>
      );

      await waitFor(() => {
        const priceElement = container.querySelector('.text-lg');
        expect(priceElement).toBeInTheDocument();
      });
    });
  });

  describe('Custom Currency Override', () => {
    it('should use targetCurrency prop when provided', async () => {
      bceeApi.getPriceDisplay.mockResolvedValue({
        base: { amount: 20.00, currency: 'USD' },
        local: { amount: 18.40, currency: 'EUR' },
        label: '$20.00 (approx. €18.40)',
        exchange_rate: 0.92,
      });

      render(
        <MockAuthProvider>
          <PriceTag usdAmount={20.00} targetCurrency="EUR" />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(bceeApi.getPriceDisplay).toHaveBeenCalledWith(20.00, 'EUR', null);
      });
    });
  });
});
