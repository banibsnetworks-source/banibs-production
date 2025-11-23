import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Code, Key, Webhook, Book, Activity, ArrowLeft } from 'lucide-react';

function DevLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/developer', label: 'Dashboard', icon: Activity },
    { path: '/developer/api-keys', label: 'API Keys', icon: Key },
    { path: '/developer/apps', label: 'Apps', icon: Code },
    { path: '/developer/webhooks', label: 'Webhooks', icon: Webhook },
    { path: '/developer/docs', label: 'Docs', icon: Book },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Top Navigation */}
      <div className="bg-black/50 backdrop-blur-md border-b border-[#39FF14]/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center text-gray-400 hover:text-white transition">
                <ArrowLeft className="mr-2" size={20} />
                <span className="text-sm font-semibold">Back to BANIBS</span>
              </Link>
              <div className="h-8 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <Code className="text-[#39FF14]" size={24} />
                <span className="text-xl font-bold text-white">BANIBS OS</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-[#39FF14]/20 text-[#39FF14]'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="mr-2" size={18} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}

export default DevLayout;
