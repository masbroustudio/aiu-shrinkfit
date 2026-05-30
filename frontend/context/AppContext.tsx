import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Message, ShrinkflationSignal, ScrapingLog, AlertRule, AppNotification } from '../types';

interface AppState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  brightDataApiKey: string;
  setBrightDataApiKey: (key: string) => void;
  // Global Chat State
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentSignal: ShrinkflationSignal | null;
  setCurrentSignal: React.Dispatch<React.SetStateAction<ShrinkflationSignal | null>>;
  // Network & Alerts State
  scrapingLogs: ScrapingLog[];
  addScrapingLog: (log: ScrapingLog) => void;
  alertRules: AlertRule[];
  addAlertRule: (rule: AlertRule) => void;
  deleteAlertRule: (id: string) => void;
  toggleAlertRule: (id: string) => void;
  notifications: AppNotification[];
  addNotification: (notif: AppNotification) => void;
  // UI State
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (val: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Kopi Sachet ABC 10s',
    brand: 'PT ABC',
    category: 'Beverages',
    targetTicker: 'MYOR.JK',
    historicalPrice: 1.50,
    historicalWeight: 250,
    unit: 'g',
    lastChecked: new Date().toISOString().split('T')[0],
    currentPrice: 1.50,
    currentWeight: 220,
    status: 'shrinkflation_detected',
    url: 'https://shopee.co.id/kopi-abc'
  },
  {
    id: '2',
    name: 'Sabun Mandi XYZ',
    brand: 'Unilever',
    category: 'Personal Care',
    targetTicker: 'UNVR.JK',
    historicalPrice: 2.50,
    historicalWeight: 400,
    unit: 'ml',
    lastChecked: new Date().toISOString().split('T')[0],
    currentPrice: 2.50,
    currentWeight: 380,
    status: 'shrinkflation_detected',
    url: 'https://shopee.co.id/sabun-xyz'
  },
  {
    id: '3',
    name: 'Susu Bear Brand',
    brand: 'Nestle',
    category: 'Dairy',
    targetTicker: 'NSRGY',
    historicalPrice: 1.05,
    historicalWeight: 189,
    unit: 'ml',
    lastChecked: new Date().toISOString().split('T')[0],
    currentPrice: 1.05,
    currentWeight: 180,
    status: 'shrinkflation_detected',
    url: 'https://shopee.co.id/bear-brand'
  }
];

const INITIAL_LOGS: ScrapingLog[] = [
  { id: 'log1', url: 'https://shopee.co.id/kopi-abc', status: 200, timestamp: new Date(Date.now() - 3600000 * 2), proxy: '114.125.xx.xx (ID)' },
  { id: 'log2', url: 'https://shopee.co.id/sabun-xyz', status: 200, timestamp: new Date(Date.now() - 3600000 * 1.5), proxy: '103.82.xx.xx (ID)' },
  { id: 'log3', url: 'https://shopee.co.id/bear-brand', status: 403, timestamp: new Date(Date.now() - 3600000 * 1), proxy: 'Blocked - Retrying' },
  { id: 'log4', url: 'https://shopee.co.id/bear-brand', status: 200, timestamp: new Date(Date.now() - 3600000 * 0.5), proxy: '180.252.xx.xx (ID)' },
];

const INITIAL_RULES: AlertRule[] = [
  { id: 'rule1', name: 'Major Shrinkflation Alert', condition: 'Weight Drop > 5%', action: 'Email to Analyst Team', active: true },
  { id: 'rule2', name: 'Competitor Price Hike', condition: 'Price Increase > 10%', action: 'Slack Webhook', active: true },
  { id: 'rule3', name: 'Unilever Margin Expansion', condition: 'Ticker = UNVR.JK & Shrinkflation Detected', action: 'Email to Portfolio Manager', active: false },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif1',
    title: 'System: Bright Data Sync Completed',
    message: 'Successfully scraped initial target URLs across platforms.',
    timestamp: new Date(Date.now() - 86400000),
    type: 'info'
  }
];

// Helper for localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    
    // Revive dates if it's an array of objects with timestamps
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        const newItem = { ...item };
        if (newItem.timestamp) newItem.timestamp = new Date(newItem.timestamp);
        return newItem;
      }) as unknown as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadFromStorage('sai_user', null));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('sai_products', INITIAL_PRODUCTS));
  const [brightDataApiKey, setBrightDataApiKey] = useState(() => loadFromStorage('sai_bdkey', ''));
  
  const [chatMessages, setChatMessages] = useState<Message[]>(() => loadFromStorage('sai_chat', []));
  const [currentSignal, setCurrentSignal] = useState<ShrinkflationSignal | null>(() => loadFromStorage('sai_signal', null));

  const [scrapingLogs, setScrapingLogs] = useState<ScrapingLog[]>(() => loadFromStorage('sai_logs', INITIAL_LOGS));
  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => loadFromStorage('sai_rules', INITIAL_RULES));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadFromStorage('sai_notifs', INITIAL_NOTIFICATIONS));

  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadFromStorage('sai_theme', 'dark'));
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => loadFromStorage('sai_onboarding', false));

  // Auto-save to localStorage
  useEffect(() => { localStorage.setItem('sai_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('sai_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('sai_bdkey', JSON.stringify(brightDataApiKey)); }, [brightDataApiKey]);
  useEffect(() => { localStorage.setItem('sai_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('sai_signal', JSON.stringify(currentSignal)); }, [currentSignal]);
  useEffect(() => { localStorage.setItem('sai_logs', JSON.stringify(scrapingLogs)); }, [scrapingLogs]);
  useEffect(() => { localStorage.setItem('sai_rules', JSON.stringify(alertRules)); }, [alertRules]);
  useEffect(() => { localStorage.setItem('sai_notifs', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('sai_theme', JSON.stringify(theme)); }, [theme]);
  useEffect(() => { localStorage.setItem('sai_onboarding', JSON.stringify(hasCompletedOnboarding)); }, [hasCompletedOnboarding]);

  // Apply theme to body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.remove('dark');
      // For hackathon demo, we just show a toast since full light mode requires extensive class changes
      console.log("Light mode selected. Note: Full light mode requires extensive Tailwind class updates. Defaulting to dark aesthetic for enterprise feel.");
    } else {
      document.body.classList.add('dark');
    }
  }, [theme]);

  const login = (userData: User) => setUser(userData);
  const logout = () => {
    setUser(null);
    setChatMessages([]);
    setCurrentSignal(null);
  };

  const addProduct = (p: Product) => setProducts([...products, p]);
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const addScrapingLog = (log: ScrapingLog) => setScrapingLogs(prev => [log, ...prev]);
  
  const addAlertRule = (rule: AlertRule) => setAlertRules(prev => [...prev, rule]);
  const deleteAlertRule = (id: string) => setAlertRules(prev => prev.filter(r => r.id !== id));
  const toggleAlertRule = (id: string) => setAlertRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  
  const addNotification = (notif: AppNotification) => setNotifications(prev => [notif, ...prev]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, addProduct, updateProduct, deleteProduct,
      brightDataApiKey, setBrightDataApiKey,
      chatMessages, setChatMessages,
      currentSignal, setCurrentSignal,
      scrapingLogs, addScrapingLog,
      alertRules, addAlertRule, deleteAlertRule, toggleAlertRule,
      notifications, addNotification,
      theme, setTheme,
      hasCompletedOnboarding, setHasCompletedOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
