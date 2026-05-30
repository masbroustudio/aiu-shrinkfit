import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { History, Package, DollarSign } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const PriceHistory: React.FC = () => {
  const { products } = useAppContext();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Generate simulated time-series data based on the selected product's historical and current data
  const timeSeriesData = useMemo(() => {
    if (!selectedProduct) return [];

    const data = [];
    const now = new Date();
    
    // Create 6 data points over the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      
      // Simulate the transition from historical to current
      // If i > 1 (more than 1 month ago), use historical. Otherwise use current.
      const isHistorical = i > 1;
      
      const weight = isHistorical ? selectedProduct.historicalWeight : (selectedProduct.currentWeight || selectedProduct.historicalWeight);
      const price = isHistorical ? selectedProduct.historicalPrice : (selectedProduct.currentPrice || selectedProduct.historicalPrice);
      const ppu = price / weight;

      data.push({
        date: date.toISOString().split('T')[0],
        weight: weight,
        price: price,
        ppu: Number(ppu.toFixed(4)),
        source: isHistorical ? 'Baseline' : 'Bright Data'
      });
    }
    return data;
  }, [selectedProduct]);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Price & Weight History</h1>
        <p className="text-slate-400">Time-series view of product specifications over time.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-medium text-slate-400 mb-2">Select Product</label>
            <select 
              value={selectedProductId} 
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y', 'All'].map(range => (
              <button key={range} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${range === 'All' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedProduct ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" /> Weight Over Time ({selectedProduct.unit})
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Line type="stepAfter" dataKey="weight" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PPU Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Price Per Unit (USD/{selectedProduct.unit})
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Line type="stepAfter" dataKey="ppu" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 py-12">Please select a product to view history.</div>
      )}

      {/* Data Table */}
      {selectedProduct && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">Data Points</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Weight</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">PPU</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {timeSeriesData.map((point, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{point.date}</td>
                    <td className="px-6 py-4 font-bold text-amber-400">{point.weight}{selectedProduct.unit}</td>
                    <td className="px-6 py-4">${point.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-emerald-400">${point.ppu}/{selectedProduct.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${point.source === 'Bright Data' ? 'bg-brand-500/10 text-brand-400' : 'bg-slate-800 text-slate-400'}`}>
                        {point.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
