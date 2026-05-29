import React from 'react';
import { ShrinkflationSignal } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Package, DollarSign } from 'lucide-react';

interface Props {
  signal: ShrinkflationSignal | null;
}

export const SignalDashboard: React.FC<Props> = ({ signal }) => {
  if (!signal) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border-l border-slate-800 bg-slate-900/50">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
          <Package className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-400 mb-2">Awaiting Intelligence Signal</h3>
        <p className="text-sm max-w-xs">
          Start a conversation to analyze products. This dashboard will automatically display shrinkflation metrics if detected.
        </p>
      </div>
    );
  }

  const oldPricePerUnit = signal.price / signal.oldWeight;
  const newPricePerUnit = signal.price / signal.newWeight;

  const chartData = [
    {
      name: 'Historical',
      'Price per Unit': Number(oldPricePerUnit.toFixed(2)),
      weight: signal.oldWeight,
    },
    {
      name: 'Live (Today)',
      'Price per Unit': Number(newPricePerUnit.toFixed(2)),
      weight: signal.newWeight,
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 overflow-y-auto">
      <div className="p-6 border-b border-slate-800 bg-slate-850">
        <div className="flex items-center gap-3 mb-1">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-100">Shrinkflation Signal Detected</h2>
        </div>
        <p className="text-slate-400 text-sm">Comparative analysis of historical vs live data.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Product Header */}
        <div>
          <h3 className="text-2xl font-bold text-emerald-400 mb-1">{signal.productName}</h3>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            Fixed Price: ${signal.price.toFixed(2)}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Size Reduction</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">-{signal.shrinkflationPercentage}%</span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {signal.oldWeight}{signal.unit} &rarr; {signal.newWeight}{signal.unit}
            </div>
          </div>

          <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-800/30">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Est. Margin Expansion</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">+{signal.marginImpactPercentage}%</span>
            </div>
            <div className="text-sm text-emerald-500/70 mt-1">
              Hidden price per {signal.unit} increase
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800">
          <h4 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price per {signal.unit.toUpperCase()} Comparison (USD)
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  formatter={(value: number) => [`$${value}`, `Price per ${signal.unit}`]}
                />
                <Bar dataKey="Price per Unit" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#64748b' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 text-sm text-blue-200">
          <strong>Analyst Note:</strong> This data indicates the company is maintaining consumer psychological price points while reducing per-unit production costs. This is a <em>bullish</em> signal for the upcoming quarterly earnings report.
        </div>
      </div>
    </div>
  );
};
