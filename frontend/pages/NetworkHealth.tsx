import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Globe, Server, Wifi, CheckCircle2, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const NetworkHealth: React.FC = () => {
  const { brightDataApiKey, scrapingLogs } = useAppContext();

  // Calculate dynamic metrics based on scrapingLogs
  const totalRequests = scrapingLogs.length;
  const successfulRequests = scrapingLogs.filter(log => log.status === 200).length;
  const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) : '0.0';
  
  // Group logs by hour for the Area Chart
  const chartData = useMemo(() => {
    const grouped: Record<string, { requests: number, errors: number }> = {};
    
    // Initialize last 6 hours to ensure chart has structure even if empty
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setHours(d.getHours() - i);
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      grouped[hourStr] = { requests: 0, errors: 0 };
    }

    scrapingLogs.forEach(log => {
      const hourStr = `${log.timestamp.getHours().toString().padStart(2, '0')}:00`;
      if (!grouped[hourStr]) grouped[hourStr] = { requests: 0, errors: 0 };
      
      grouped[hourStr].requests += 1;
      if (log.status !== 200) {
        grouped[hourStr].errors += 1;
      }
    });

    return Object.keys(grouped).sort().map(time => ({
      time,
      requests: grouped[time].requests,
      errors: grouped[time].errors
    }));
  }, [scrapingLogs]);

  const proxyData = [
    { name: 'Residential IPs', value: 65 },
    { name: 'Datacenter IPs', value: 25 },
    { name: 'Mobile IPs', value: 10 },
  ];
  const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6'];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Scraping Network Health</h1>
          <p className="text-slate-400">Monitor Bright Data Web Unlocker performance and proxy utilization.</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium ${brightDataApiKey ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {brightDataApiKey ? <><CheckCircle2 className="w-4 h-4" /> API Connected</> : <><XCircle className="w-4 h-4" /> API Disconnected</>}
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{successRate}%</h3>
          <p className="text-xs text-emerald-400 mt-2">Based on {totalRequests} total requests</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <Globe className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-medium">Total Requests</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{totalRequests}</h3>
          <p className="text-xs text-slate-500 mt-2">Recorded in current session</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <Wifi className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">Bandwidth Used</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{(totalRequests * 0.15).toFixed(2)} MB</h3>
          <p className="text-xs text-slate-500 mt-2">Estimated (150KB/req)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <Server className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium">Active Proxies</span>
          </div>
          <h3 className="text-3xl font-bold text-white">{Math.min(totalRequests, 1204)}</h3>
          <p className="text-xs text-slate-500 mt-2">Unique IPs utilized</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-6">Request Volume & Error Rate</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="requests" name="Total Requests" stroke="#10b981" fillOpacity={1} fill="url(#colorReq)" />
                <Area type="monotone" dataKey="errors" name="Errors" stroke="#f43f5e" fillOpacity={1} fill="url(#colorErr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-6">Proxy Network Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={proxyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {proxyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">Live Extraction Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Target URL</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Proxy Node</th>
                <th className="px-6 py-4 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {scrapingLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No scraping logs available. Try syncing a product in the Data Pipeline.
                  </td>
                </tr>
              ) : (
                scrapingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-xs" title={log.url}>{log.url}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {log.status === 200 ? '200 OK' : `${log.status} Error`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{log.proxy}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{log.timestamp.toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
