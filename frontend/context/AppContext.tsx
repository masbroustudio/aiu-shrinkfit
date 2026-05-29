import React, { createContext, useContext, useState } from 'react';
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
  toggleAlertRule: (id: string) => void;
  notifications: AppNotification[];
  addNotification: (notif: AppNotification) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Kopi Sachet ABC 10s',
    brand: 'PT ABC',
    category: 'Beverages',
    targetTicker: 'MYOR.JK',
    historicalPrice: 1.50, // Converted to USD
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
    historicalPrice: 2.50, // Converted to USD
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
    historicalPrice: 1.05, // Converted to USD
    historicalWeight: 189,
    unit: 'ml',
    lastChecked: new Date().toISOString().split('T')[0],
    currentPrice: 1.05,
    currentWeight: 180,
    status: 'shrinkflation_detected',
    url: 'https://shopee.co.id/bear-brand'
  }
];

// Initial historical logs to populate the chart
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [brightDataApiKey, setBrightDataApiKey] = useState('');
  
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentSignal, setCurrentSignal] = useState<ShrinkflationSignal | null>(null);

  const [scrapingLogs, setScrapingLogs] = useState<ScrapingLog[]>(INITIAL_LOGS);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_RULES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

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
      alertRules, toggleAlertRule,
      notifications, addNotification
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
