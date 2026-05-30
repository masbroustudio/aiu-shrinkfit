import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Package, Activity, Sparkles, RefreshCw, ArrowRight, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateDashboardInsights } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import { ReportGenerator } from '../components/ReportGenerator';

export const DashboardHome: React.FC = () => {
  const { products, user, geminiApiKey } = useAppContext();
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string>("Analyzing data...");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInsights = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const insight = await generateDashboardInsights(products, geminiApiKey);
      setAiInsight(insight);
    } catch (error) {
      setAiInsight("Failed to load insights. Request limitation (429) or network error occurred.");
    } finally {
      setIsRefreshing(false);
    }
  }, [products, geminiApiKey]);

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 1. Dynamic Metrics Calculation
  const shrinkflatedProducts = products.filter(p => p.status === 'shrinkflation_detected');
  
  let totalMarginExpansion = 0;
  let validMarginCount = 0;

  shrinkflatedProducts.forEach(p => {
    if (p.currentWeight && p.historicalWeight && p.historicalWeight > 0 && p.currentWeight > 0) {
      const oldPricePerUnit = p.historicalPrice / p.historicalWeight;
      const newPricePerUnit = (p.currentPrice || p.historicalPrice) / p.currentWeight;
      
      const marginIncrease = ((newPricePerUnit - oldPricePerUnit) / oldPricePerUnit) * 100;
      
      if (!isNaN(marginIncrease) && isFinite(marginIncrease)) {
        totalMarginExpansion += marginIncrease;
        validMarginCount++;
      }
    }
  });

  const avgMargin = validMarginCount > 0 ? totalMarginExpansion / validMarginCount : 0;

  // 2. Dynamic Category Data
  const categoryMap = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { name: p.category, count: 0, shrink: 0 };
    acc[p.category].count += 1;
    if (p.status === 'shrinkflation_detected') acc[p.category].shrink += 1;
    return acc;
  }, {} as Record<string, { name: string, count: number, shrink: number }>);
  
  const dynamicCategoryData = Object.values(categoryMap);
  const topCategory = dynamicCategoryData.sort((a, b) => b.shrink - a.shrink)[0]?.name || 'N/A';

  // 3. Dynamic Margin Impact Data
  const marginImpactData = products
    .filter(p => p.currentWeight && p.currentPrice && p.historicalWeight > 0 && p.currentWeight > 0)
    .map(p => {
      const oldPpu = p.historicalPrice / p.historicalWeight;
      const newPpu = p.currentPrice! / p.currentWeight!;
      const marginIncrease = ((newPpu - oldPpu) / oldPpu) * 100;
      return {
        name: p.targetTicker,
        product: p.name,
        'Margin Expansion (%)': Number(marginIncrease.toFixed(2))
      };
    });

  // 4. Signal Board Data
  const signalBoard = Array.from(new Set(products.map(p => p.targetTicker))).map(ticker => {
    const tickerProducts = products.filter(p => p.targetTicker === ticker);
    let maxMargin = 0;
    tickerProducts.forEach(p => {
      if (p.status === 'shrinkflation_detected' && p.currentWeight && p.historicalWeight) {
        const oldPpu = p.historicalPrice / p.historicalWeight;
        const newPpu = (p.currentPrice || p.historicalPrice) / p.currentWeight;
        const margin = ((newPpu - oldPpu) / oldPpu) * 100;
        if (margin > maxMargin) maxMargin = margin;
      }
    });
    
    let strength = 'NO SIGNAL';
    let color = 'text-slate-500';
    if (maxMargin > 10) { strength = 'STRONG'; color = 'text-emerald-400'; }
    else if (maxMargin > 5) { strength = 'MODERATE'; color = 'text-amber-400'; }
    else if (maxMargin > 0) { strength = 'WEAK'; color = 'text-orange-400'; }

    return { ticker, maxMargin, strength, color };
  }).sort((a, b) => b.maxMargin - a.maxMargin).slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 tour-dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Market Intelligence Overview</h1>
          <p className="text-slate-400">Real-time FMCG margin expansion tracking via alternative data.</p>
        </div>
        <ReportGenerator products={products} user={user} aiInsight={aiInsight} />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Package className="w-5 h-5 text-blue-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{products.length}</h3>
          <p className="text-sm text-slate-400">Total Products Tracked</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-amber-400 mb-1">{shrinkflatedProducts.length}</h3>
          <p className="text-sm text-slate-400">Active Shrinkflation Alerts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-emerald-400 mb-1">+{avgMargin.toFixed(1)}%</h3>
          <p className="text-sm text-slate-400">Avg Est. Margin Expansion</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Activity className="w-5 h-5 text-purple-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-purple-400 mb-1 truncate" title={topCategory}>{topCategory}</h3>
          <p className="text-sm text-slate-400">Top Shrinking Category</p>
        </div>
      </div>

      {/* Pre-Earnings Signal Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Pre-Earnings Intelligence Signals
          </h3>
          <button onClick={() => navigate('/app/earnings')} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View Calendar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signalBoard.map((sig, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-800 ${sig.color}`}>
                  {sig.strength}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{sig.ticker}</h4>
              <p className="text-sm text-slate-400">
                {sig.maxMargin > 0 ? `+${sig.maxMargin.toFixed(1)}% est. margin` : 'Data insufficient'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">AI Analyst Insights</h2>
          </div>
          <button 
            onClick={fetchInsights} 
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line relative z-10">
          {aiInsight}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Dynamic Category Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-6">Shrinkflation by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="count" name="Total Tracked" fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shrink" name="Shrinkflated" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Dynamic Margin Impact */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-6">Est. Margin Expansion by Ticker</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marginImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="Margin Expansion (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
