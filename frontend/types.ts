export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'analyst' | 'admin';
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  groundingUrls?: { uri: string; title: string }[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  targetTicker: string; // e.g., UNVR.JK, ICBP.JK, LOGI
  historicalPrice: number; // In USD
  historicalWeight: number;
  unit: string;
  lastChecked: string;
  currentPrice?: number; // In USD
  currentWeight?: number;
  status: 'monitoring' | 'shrinkflation_detected' | 'stable';
  url: string; // E-commerce URL for Bright Data
}

export interface ShrinkflationSignal {
  signalDetected: boolean;
  productName: string;
  oldWeight: number;
  newWeight: number;
  unit: string;
  price: number; // In USD
  shrinkflationPercentage: number;
  marginImpactPercentage: number;
  predictiveIndex?: number; // 0-100 likelihood of further shrinkflation
}

export interface DashboardMetrics {
  totalTracked: number;
  activeAlerts: number;
  avgMarginExpansion: number;
  topShrinkingCategory: string;
}

export interface ScrapingLog {
  id: string;
  url: string;
  status: number;
  timestamp: Date;
  proxy: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'warning' | 'info' | 'success';
}

export interface ExtractedProductData {
  name: string;
  brand: string;
  category: string;
  targetTicker: string;
  price: number;
  weight: number;
  unit: string;
}
