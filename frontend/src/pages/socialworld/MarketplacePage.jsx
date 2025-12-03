import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS Social Marketplace - Creator marketplace integration
 * Placeholder for Phase 2
 */
const MarketplacePage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-emerald-500 to-green-500">
            <ShoppingBag size={64} />
          </div>
          <h1 className="placeholder-title">Social Shop</h1>
          <p className="placeholder-description">
            Discover and shop from creators you love. Support independent
            creators and find unique products from your community.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default MarketplacePage;