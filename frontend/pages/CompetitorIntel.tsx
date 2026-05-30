import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { ShieldAlert, TrendingDown, Crosshair } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CompetitorIntel: React.FC = () => {
  const { products } = useAppContext();

  // 1. Dynamic Aggregation by Brand
  const brandStats = useMemo(() => {
    const map = products.reduce((acc, p) => {
      if (!acc[p.brand]) {
        acc[p.brand] = {
          brand: p.brand,
          totalProducts: 0,
          shrinkflated: 0,
          avgMarginExpansion: 0,
          volumeRetention: 0,
        };
      }
      
      acc[p.brand].totalProducts += 1;
      
      const currentW = p.currentWeight || p.historicalWeight;
      const currentP = p.currentPrice || p.historicalPrice;
      
      if (p.status === 'shrinkflation_detected' && p.historicalWeight > 0 && currentW > 0) {
        acc[p.brand].shrinkflated += 1;
        const oldPpu = p.historicalPrice / p.historicalWeight;
        const newPpu = currentP / currentW;
        acc[p.brand].avgMarginExpansion += ((newPpu - oldPpu) / oldPpu) * 100;
      }
      
      if (p.historicalWeight > 0) {
         acc[p.brand].volumeRetention += (currentW / p.historicalWeight) * 100;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(map).map(b => ({
      ...b,
      volumeRetentionScore: b.totalProducts > 0 ? b.volumeRetention / b.totalProducts : 0,
      shrinkflationRiskScore: b.totalProducts > 0 ? (b.shrinkflated / b.totalProducts) * 100 : 0,
      marginExpansionScore: b.shrinkflated > 0 ? b.avgMarginExpansion / b.shrinkflated : 0
    }));
  }, [products]);

  // 2. Prepare Dynamic Radar Data
  const radarData = useMemo(() => {
    const subjects = [
      { key: 'volumeRetentionScore', label: 'Volume Retention' },
      { key: 'shrinkflationRiskScore', label: 'Shrinkflation Risk' },
      { key: 'marginExpansionScore', label: 'Margin Expansion' }
    ];

    return subjects.map(subj => {
      const dataPoint: any = { subject: subj.label, fullMark: 100 };
      brandStats.forEach(b => {
        dataPoint[b.brand] = Number(b[subj.key].toFixed(1));
      });
      return dataPoint;
    });
  }, [brandStats]);

  // 3. Prepare Dynamic Bar Chart Data (Price Per Unit Comparison)
  const ppuData = useMemo(() => {
    return products
      .filter(p => p.historicalWeight > 0 && (p.currentWeight || p.historicalWeight) > 0)
      .map(p => {
        const oldPpu = p.historicalPrice / p.historicalWeight;
        const newPpu = (p.currentPrice || p.historicalPrice) / (p.currentWeight || p.historicalWeight);
        return {
          name: p.targetTicker,
          'Historical PPU': Number(oldPpu.toFixed(2)),
          'Live PPU': Number(newPpu.toFixed(2))
        };
      });
  }, [products]);

  // 4. Dynamic Correlation Data (Stock Price vs Margin Expansion)
  // Since we don't have a real stock API, we generate a trend based on the actual margin expansion data
  const correlationData = useMemo(() => {
    const data = [];
    const basePrice = 2000; // Arbitrary base stock price
    
    // Get the average margin expansion across all products
    const avgMargin = brandStats.reduce((acc, b) => acc + b.marginExpansionScore, 0) / (brandStats.length || 1);
    
    // Create a 6-month trend
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simulate margin growing over time to reach the current avgMargin
      const simulatedMargin = i === 0 ? avgMargin : Math.max(0, avgMargin - (i * 2));
      
      // Simulate stock price reacting to margin expansion
      const simulatedPrice = basePrice + (simulatedMargin * 50) + (Math.random() * 100 - 50);
      
      data.push({
        date: date.toISOString().split('T')[0].substring(0, 7), // YYYY-MM
        price: Number(simulatedPrice.toFixed(0)),
        margin: Number(simulatedMargin.toFixed(1))
      });
    }
    return data;
  }, [brandStats]);

  // Calculate Top Cards Dynamically
  const mostAggressive = [...brandStats].sort((a, b) => b.shrinkflationRiskScore - a.shrinkflationRiskScore)[0];
  const highestRetention = [...brandStats].sort((a, b) => b.volumeRetentionScore - a.volumeRetentionScore)[0];
  const highestMargin = [...brandStats].sort((a, b) => b.marginExpansionScore - a.marginExpansionScore)[0];

  // Colors for dynamic brands
  const colors = ['#f43f5e', '#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6'];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Competitor Intelligence</h1>
        <p className="text-slate-400">Analyze market positioning and shrinkflation strategies across major FMCG players.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl"><TrendingDown className="w-6 h-6 text-rose-400" /></div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Most Aggressive Shrinkflation</h3>
            <p className="text-2xl font-bold text-white">{mostAggressive?.brand || 'N/A'}</p>
            <p className="text-xs text-rose-400 mt-1">{mostAggressive?.shrinkflationRiskScore.toFixed(1)}% Risk Score</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl"><ShieldAlert className="w-6 h-6 text-emerald-400" /></div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Highest Volume Retention</h3>
            <p className="text-2xl font-bold text-white">{highestRetention?.brand || 'N/A'}</p>
            <p className="text-xs text-emerald-400 mt-1">{highestRetention?.volumeRetentionScore.toFixed(1)}% Retained</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-3 bg-brand-500/10 rounded-xl"><Crosshair className="w-6 h-6 text-brand-400" /></div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Strategic Margin Focus</h3>
            <p className="text-2xl font-bold text-white">{highestMargin?.brand || 'N/A'}</p>
            <p className="text-xs text-brand-400 mt-1">+{highestMargin?.marginExpansionScore.toFixed(1)}% Avg Expansion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dynamic Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-6">Strategic Positioning Matrix</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                {brandStats.map((b, idx) => (
                  <Radar key={b.brand} name={b.brand} dataKey={b.brand} stroke={colors[idx % colors.length]} fill={colors[idx % colors.length]} fillOpacity={0.3} />
                ))}
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-6">Price Per Unit (PPU) Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ppuData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Historical PPU" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Live PPU" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Correlation Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-6">Market Correlation: Margin Expansion vs Stock Price Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={correlationData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="right" dataKey="margin" name="Avg Margin Expansion (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              <Line yAxisId="left" type="monotone" dataKey="price" name="Simulated Index Price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
