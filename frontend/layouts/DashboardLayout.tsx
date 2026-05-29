import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Radar, LayoutDashboard, MessageSquare, PackageSearch, Settings, LogOut, LineChart, Activity, BellRing } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'BI Dashboard' },
    { path: '/app/chat', icon: MessageSquare, label: 'AI Analyst Agent' },
    { path: '/app/products', icon: PackageSearch, label: 'Data Pipeline' },
    { path: '/app/competitors', icon: LineChart, label: 'Competitor Intel' },
    { path: '/app/network', icon: Activity, label: 'Scraping Network' },
    { path: '/app/alerts', icon: BellRing, label: 'Alerts & Triggers' },
    { path: '/app/settings', icon: Settings, label: 'Settings & API' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <Radar className="w-8 h-8 text-emerald-500" />
          <span className="text-xl font-bold tracking-tight text-white">Shrinkflation<span className="text-emerald-500">AI</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
