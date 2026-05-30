import React, { useMemo } from 'react';
import { CalendarDays, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EarningsEvent } from '../types';

export const EarningsCalendar: React.FC = () => {
  const { products } = useAppContext();

  // Generate simulated earnings dates based on tracked products
  const earningsData: EarningsEvent[] = useMemo(() => {
    const uniqueTickers = Array.from(new Set(products.map(p => p.targetTicker)));
    
    return uniqueTickers.map((ticker, index) => {
      // Find products for this ticker to calculate signal strength
      const tickerProducts = products.filter(p => p.targetTicker === ticker);
      let maxMarginExpansion = 0;
      let hasShrinkflation = false;

      tickerProducts.forEach(p => {
        if (p.status === 'shrinkflation_detected' && p.currentWeight && p.historicalWeight) {
          hasShrinkflation = true;
          const oldPpu = p.historicalPrice / p.historicalWeight;
          const newPpu = (p.currentPrice || p.historicalPrice) / p.currentWeight;
          const margin = ((newPpu - oldPpu) / oldPpu) * 100;
          if (margin > maxMarginExpansion) maxMarginExpansion = margin;
        }
      });

      let signalStrength: 'strong' | 'moderate' | 'weak' | 'none' = 'none';
      if (hasShrinkflation) {
        if (maxMarginExpansion > 10) signalStrength = 'strong';
        else if (maxMarginExpansion > 5) signalStrength = 'moderate';
        else signalStrength = 'weak';
      }

      // Simulate dates: 7, 14, 30, 45 days from now
      const daysUntil = [7, 14, 30, 45, 60][index % 5];
      const date = new Date();
      date.setDate(date.getDate() + daysUntil);

      return {
        ticker,
        company: tickerProducts[0]?.brand || ticker,
        earningsDate: date.toISOString().split('T')[0],
        daysUntil,
        signalStrength,
        marginExpansion: maxMarginExpansion
      };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  }, [products]);

  const next7Days = earningsData.filter(e => e.daysUntil <= 7).length;
  const next30Days = earningsData.filter(e => e.daysUntil <= 30).length;
  const signalReady = earningsData.filter(e => e.signalStrength !== 'none').length;

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'weak': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Earnings Calendar</h1>
        <p className="text-slate-400">Track upcoming earnings dates and correlate with shrinkflation signals for maximum alpha generation.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <Clock className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-medium">Next 7 Days</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{next7Days}</h3>
          <p className="text-xs text-slate-500 mt-2">Earnings Due</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <CalendarDays className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Next 30 Days</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{next30Days}</h3>
          <p className="text-xs text-slate-500 mt-2">Earnings Due</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Signal Ready</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{signalReady}</h3>
          <p className="text-xs text-slate-500 mt-2">With Shrinkflation Signals</p>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 overflow-x-auto">
        <h3 className="text-base font-semibold text-white mb-6">Timeline View</h3>
        <div className="flex items-center min-w-[600px] py-4">
          <div className="w-16 text-xs font-bold text-slate-500">TODAY</div>
          <div className="flex-1 h-1 bg-slate-800 relative rounded-full mx-4">
            {earningsData.map((event, idx) => {
              // Map 0-60 days to 0-100% width
              const leftPercent = Math.min((event.daysUntil / 60) * 100, 100);
              return (
                <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${leftPercent}%` }}>
                  <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${event.signalStrength === 'strong' ? 'bg-emerald-500' : event.signalStrength === 'moderate' ? 'bg-amber-500' : event.signalStrength === 'weak' ? 'bg-orange-500' : 'bg-slate-500'}`}></div>
                  <div className="mt-2 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center">
                    <div className="text-xs font-bold text-white">{event.ticker}</div>
                    <div className="text-[10px] text-slate-400">{event.daysUntil}d</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-16 text-xs font-bold text-slate-500 text-right">+60d</div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">Detailed Earnings Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Ticker</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Earn Date</th>
                <th className="px-6 py-4 font-medium">Days Left</th>
                <th className="px-6 py-4 font-medium">Signal Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {earningsData.map((event, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{event.ticker}</td>
                  <td className="px-6 py-4">{event.company}</td>
                  <td className="px-6 py-4">{event.earningsDate}</td>
                  <td className="px-6 py-4">
                    <span className="text-brand-400 font-mono">{event.daysUntil}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-max ${getSignalColor(event.signalStrength)}`}>
                      {event.signalStrength === 'strong' && <TrendingUp className="w-3 h-3" />}
                      {event.signalStrength === 'moderate' && <AlertTriangle className="w-3 h-3" />}
                      {event.signalStrength.toUpperCase()}
                      {event.marginExpansion ? ` (+${event.marginExpansion.toFixed(1)}%)` : ''}
                    </span>
                  </td>
                </tr>
              ))}
              {earningsData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No tracked products to generate earnings calendar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
