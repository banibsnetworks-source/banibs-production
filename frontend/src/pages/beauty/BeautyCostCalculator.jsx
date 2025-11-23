import React, { useState } from 'react';
import { Calculator, TrendingDown, DollarSign } from 'lucide-react';
import BeautyLayout from '../../components/beauty/BeautyLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

const BeautyCostCalculator = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [expenses, setExpenses] = useState({
    hair: 0,
    nails: 0,
    skincare: 0,
    lashes: 0,
    makeup: 0,
    other: 0
  });
  
  const [calculated, setCalculated] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const handleChange = (category, value) => {
    setExpenses({
      ...expenses,
      [category]: parseFloat(value) || 0
    });
    setCalculated(false);
  };
  
  const monthlyTotal = Object.values(expenses).reduce((sum, val) => sum + val, 0);
  const yearlyTotal = monthlyTotal * 12;
  const potentialSavings = yearlyTotal * 0.2; // 20% potential savings
  
  const handleCalculate = () => {
    setCalculated(true);
  };
  
  const handleSave = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save your spending snapshot');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/beauty/spending`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            monthly_spend: monthlyTotal,
            categories: expenses
          })
        }
      );
      alert('Spending snapshot saved!');
    } catch (err) {
      alert('Failed to save snapshot');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <BeautyLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Beauty Cost Calculator
          </h1>
          <p className="text-muted-foreground">
            Track your beauty spending and discover potential savings
          </p>
        </div>
        
        {/* Input Form */}
        <div 
          className="p-6 rounded-lg border mb-6"
          style={{
            background: isDark ? '#1A1A1A' : '#FFFFFF',
            borderColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB'
          }}
        >
          <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <Calculator size={24} className="text-pink-500" />
            Monthly Beauty Expenses
          </h2>
          
          <div className="space-y-4">
            {Object.keys(expenses).map((category) => (
              <div key={category}>
                <label className="block text-sm font-medium text-foreground mb-1 capitalize">
                  {category}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenses[category] || ''}
                    onChange={(e) => handleChange(category, e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleCalculate}
            className="w-full mt-6 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Calculate My Spending
          </button>
        </div>
        
        {/* Results */}
        {calculated && monthlyTotal > 0 && (
          <div className="space-y-4">
            {/* Monthly Total */}
            <div 
              className="p-6 rounded-lg border"
              style={{
                background: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Total</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${monthlyTotal.toFixed(2)}
                  </p>
                </div>
                <DollarSign size={48} className="text-pink-500/20" />
              </div>
            </div>
            
            {/* Yearly Total */}
            <div 
              className="p-6 rounded-lg"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(249, 168, 212, 0.1))'
                  : 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(249, 168, 212, 0.05))',
                border: `1px solid ${isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)'}`
              }}
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Yearly Spending</p>
                <p className="text-4xl font-bold text-foreground mb-4">
                  ${yearlyTotal.toFixed(2)}
                </p>
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingDown size={20} className="text-green-500" />
                    <p className="text-sm font-medium text-foreground">Potential Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    ${potentialSavings.toFixed(2)}/year
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    By switching to Black-owned brands and smart shopping
                  </p>
                </div>
              </div>
            </div>
            
            {/* Community Impact */}
            <div 
              className="p-6 rounded-lg border"
              style={{
                background: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB'
              }}
            >
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                Your Community Impact
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you redirect just half of your beauty spending to Black-owned businesses:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-pink-500">
                    ${(monthlyTotal / 2).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per month</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-pink-500">
                    ${(yearlyTotal / 2).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per year</p>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-4">
                That money stays in our community and builds generational wealth! 💪🏾
              </p>
            </div>
            
            {/* Save Button */}
            {isAuthenticated && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Spending Snapshot'}
              </button>
            )}
          </div>
        )}
      </div>
    </BeautyLayout>
  );
};

export default BeautyCostCalculator;
