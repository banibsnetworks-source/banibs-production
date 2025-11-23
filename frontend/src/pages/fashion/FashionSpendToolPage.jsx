import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import FashionLayout from '../../components/fashion/FashionLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

const FashionSpendToolPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [pairsPerYear, setPairsPerYear] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [calculated, setCalculated] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const annualSpend = pairsPerYear * avgPrice;
  const tenPercent = annualSpend * 0.1;
  
  const handleCalculate = () => setCalculated(true);
  
  const handleSave = async () => {
    if (!isAuthenticated) { alert('Sign in to save'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await xhrRequest(`${process.env.REACT_APP_BACKEND_URL}/api/fashion/spend`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ pairs_per_year: pairsPerYear, avg_price: avgPrice }) });
      alert('Snapshot saved!');
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FashionLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2 text-foreground">Sneaker Spend Tool</h1><p className="text-muted-foreground">Calculate your annual spending and ownership potential</p></div>
        <div className="p-6 rounded-lg border mb-6" style={{ background: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#E5E7EB' }}>
          <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2"><Calculator size={24} className="text-blue-500" />Your Sneaker Spending</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground mb-1">Pairs Per Year</label><input type="number" min="0" value={pairsPerYear || ''} onChange={(e) => { setPairsPerYear(parseInt(e.target.value) || 0); setCalculated(false); }} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Average Price Per Pair</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span><input type="number" min="0" step="0.01" value={avgPrice || ''} onChange={(e) => { setAvgPrice(parseFloat(e.target.value) || 0); setCalculated(false); }} className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background text-foreground" /></div></div>
          </div>
          <button onClick={handleCalculate} className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">Calculate</button>
        </div>
        {calculated && annualSpend > 0 && (
          <div className="space-y-4">
            <div className="p-6 rounded-lg border" style={{ background: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#E5E7EB' }}>
              <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Annual Spending</p><p className="text-3xl font-bold text-foreground">${annualSpend.toFixed(2)}</p></div><DollarSign size={48} className="text-blue-500/20" /></div>
            </div>
            <div className="p-6 rounded-lg" style={{ background: isDark ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05))', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}` }}>
              <div className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><TrendingUp size={20} className="text-green-500" /><p className="text-sm font-medium text-foreground">10% Ownership Fund</p></div><p className="text-4xl font-bold text-green-500 mb-4">${tenPercent.toFixed(2)}/year</p><p className="text-sm text-muted-foreground">If 10% went into a Black-owned brand or your own line, that's ${tenPercent.toFixed(2)} in seed money.</p></div>
            </div>
            <div className="p-6 rounded-lg border" style={{ background: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#E5E7EB' }}>
              <h3 className="text-lg font-semibold mb-3 text-foreground">The Ownership Shift</h3><p className="text-sm text-muted-foreground mb-4">Imagine redirecting just 10% of your sneaker budget into ownership:</p><div className="text-center p-4 rounded-lg bg-muted"><p className="text-2xl font-bold text-blue-500">${tenPercent.toFixed(2)}</p><p className="text-xs text-muted-foreground mt-1">Your annual ownership investment</p></div><p className="text-sm text-center text-muted-foreground mt-4">That's seed money for your brand. That's investment in Black businesses. That's generational wealth. 🚀</p></div>
            {isAuthenticated && <button onClick={handleSave} disabled={saving} className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Snapshot'}</button>}
          </div>
        )}
      </div>
    </FashionLayout>
  );
};

export default FashionSpendToolPage;