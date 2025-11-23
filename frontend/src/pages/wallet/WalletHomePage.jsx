import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Receipt, Target, Users, BarChart3, Lock } from 'lucide-react';
import WalletLayout from '../../components/wallet/WalletLayout';
import { useTheme } from '../../contexts/ThemeContext';

const WalletHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const features = [
    { icon: Wallet, title: 'Accounts', description: 'Manage multiple wallet accounts', path: '/portal/wallet/accounts', color: '#065F46' },
    { icon: Receipt, title: 'Transactions', description: 'Track all your spending', path: '/portal/wallet/transactions', color: '#047857' },
    { icon: Target, title: 'Goals', description: 'Set and achieve financial goals', path: '/portal/wallet/goals', color: '#059669' },
    { icon: Users, title: 'Family', description: 'Household financial overview', path: '/portal/wallet/family', color: '#10B981' },
    { icon: BarChart3, title: 'Insights', description: 'See where your money goes', path: '/portal/wallet/insights', color: '#34D399' }
  ];
  
  return (
    <WalletLayout>
      <div className="py-16 px-4 rounded-2xl mb-8" style={{ background: isDark ? 'linear-gradient(135deg, rgba(6, 95, 70, 0.1) 0%, rgba(6, 95, 70, 0.05) 100%)' : 'linear-gradient(135deg, rgba(6, 95, 70, 0.08) 0%, rgba(6, 95, 70, 0.04) 100%)', border: `1px solid ${isDark ? 'rgba(6, 95, 70, 0.2)' : 'rgba(6, 95, 70, 0.15)'}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: isDark ? 'rgba(6, 95, 70, 0.2)' : 'rgba(6, 95, 70, 0.15)', border: '2px solid rgba(6, 95, 70, 0.3)' }}>
            <Lock size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">BANIBS Wallet</h1>
          <p className="text-2xl md:text-3xl font-semibold mb-6 text-emerald-600">Own the flow of Black money, don't just watch it move</p>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">Track your spending, prioritize Black-owned businesses, set goals, and understand where your money flows. Your financial control center.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/10 border border-emerald-600/20"><span className="text-sm font-medium text-emerald-600">🔒 Secure • Private • Powerful</span></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button key={feature.path} onClick={() => navigate(feature.path)} className="p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left" style={{ background: isDark ? 'rgba(6, 95, 70, 0.06)' : 'rgba(6, 95, 70, 0.04)', border: `1px solid ${isDark ? 'rgba(6, 95, 70, 0.15)' : 'rgba(6, 95, 70, 0.12)'}` }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: isDark ? 'rgba(6, 95, 70, 0.15)' : 'rgba(6, 95, 70, 0.1)' }}>
                <Icon size={24} style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </button>
          );
        })}
      </div>
      
      <div className="p-6 rounded-xl" style={{ background: isDark ? 'rgba(6, 95, 70, 0.06)' : 'rgba(6, 95, 70, 0.04)', border: `1px solid ${isDark ? 'rgba(6, 95, 70, 0.15)' : 'rgba(6, 95, 70, 0.12)'}` }}>
        <h2 className="text-2xl font-bold text-foreground mb-4">Your Financial Control Center</h2>
        <div className="space-y-3 text-muted-foreground">
          <p>BANIBS Wallet isn't a bank—it's your command center for Black financial power. Track every dollar, see how much you're spending at Black-owned businesses, set goals that matter, and take control.</p>
          <p>Right now, it's manual logging and insights. Soon: real payment integration, auto-categorization, and seamless connection to the BANIBS Business Directory.</p>
          <p className="font-medium text-foreground">This is Phase 14.0 — your foundation. Real fintech power is coming.</p>
        </div>
      </div>
    </WalletLayout>
  );
};

export default WalletHomePage;
