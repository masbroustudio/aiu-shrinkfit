import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StockTicker: React.FC = () => {
  // Simulated real-time stock data
  const stocks = [
    { ticker: 'UNVR.JK', price: 2450, change: 1.2 },
    { ticker: 'ICBP.JK', price: 11800, change: -0.3 },
    { ticker: 'MYOR.JK', price: 2650, change: 0.8 },
    { ticker: 'NSRGY', price: 105.4, change: 0.1 },
    { ticker: 'INDF.JK', price: 6400, change: -1.1 },
    { ticker: 'KLBF.JK', price: 1520, change: 2.4 },
    { ticker: 'PGND.PA', price: 145.2, change: 0.5 },
  ];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden flex items-center h-10 shrink-0">
      <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
        {/* Duplicate the list to create a seamless loop */}
        {[...stocks, ...stocks, ...stocks].map((stock, idx) => (
          <div key={idx} className="flex items-center gap-2 px-6 border-r border-slate-800">
            <span className="font-bold text-xs text-slate-300">{stock.ticker}</span>
            <span className="text-xs text-slate-400">{stock.price.toLocaleString()}</span>
            <span className={`flex items-center text-[10px] font-medium ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stock.change >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {Math.abs(stock.change)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
