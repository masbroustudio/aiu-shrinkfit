import React, { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Radar, LayoutDashboard, MessageSquare, PackageSearch, Settings, LogOut, LineChart, Activity, BellRing, CalendarDays, History, Menu, X, Moon, Sun } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StockTicker } from '../components/StockTicker';
import { NotificationBell } from '../components/NotificationBell';
import { OnboardingTour } from '../components/OnboardingTour';

export const DashboardLayout: React.FC = () => {
  const { user, logout, theme, setTheme } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'BI Dashboard', className: 'tour-dashboard' },
    { path: '/app/chat', icon: MessageSquare, label: 'AI Analyst Agent', className: 'tour-agent' },
    { path: '/app/products', icon: PackageSearch, label: 'Data Pipeline', className: 'tour-pipeline' },
    { path: '/app/history', icon: History, label: 'Price History' },
    { path: '/app/competitors', icon: LineChart, label: 'Competitor Intel' },
    { path: '/app/earnings', icon: CalendarDays, label: 'Earnings Calendar' },
    { path: '/app/network', icon: Activity, label: 'Scraping Network' },
    { path: '/app/alerts', icon: BellRing, label: 'Alerts & Triggers', className: 'tour-alerts' },
    { path: '/app/settings', icon: Settings, label: 'Settings & API' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <OnboardingTour />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Radar className="w-6 h-6 text-emerald-500" />
          <span className="text-lg font-bold text-white">Shrinkflation<span className="text-emerald-500">AI</span></span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <Radar className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold tracking-tight text-white">Shrinkflation<span className="text-emerald-500">AI</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Toggle Theme">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <NotificationBell />
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${item.className || ''} ${
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
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden pt-16 lg:pt-0">
        <StockTicker />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
