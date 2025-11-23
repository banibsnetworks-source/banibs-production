import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, Receipt, Target, Users, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const WalletLeftRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const navItems = [
    { icon: Home, label: 'Overview', path: '/portal/wallet', description: 'Dashboard' },
    { icon: Wallet, label: 'Accounts', path: '/portal/wallet/accounts', description: 'Manage accounts' },
    { icon: Receipt, label: 'Transactions', path: '/portal/wallet/transactions', description: 'Track spending' },
    { icon: Target, label: 'Goals', path: '/portal/wallet/goals', description: 'Savings & debt' },
    { icon: Users, label: 'Family', path: '/portal/wallet/family', description: 'Household view' },
    { icon: BarChart3, label: 'Insights', path: '/portal/wallet/insights', description: 'Spend-Black stats' }
  ];
  
  return (
    <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(6, 95, 70, 0.05)' : 'rgba(6, 95, 70, 0.03)', border: `1px solid ${isDark ? 'rgba(6, 95, 70, 0.15)' : 'rgba(6, 95, 70, 0.1)'}` }}>
      <div className="mb-4"><h3 className="text-sm font-semibold text-foreground mb-1">💳 BANIBS Wallet</h3><p className="text-xs text-muted-foreground">Control the flow</p></div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${ isActive ? isDark ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-emerald-50 border border-emerald-200' : isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-emerald-50/50 border border-transparent' }`}>
              <Icon size={18} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} />
              <div className="flex-1 min-w-0"><div className={`text-sm font-medium ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{item.label}</div><div className="text-xs text-muted-foreground mt-0.5">{item.description}</div></div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default WalletLeftRail;
