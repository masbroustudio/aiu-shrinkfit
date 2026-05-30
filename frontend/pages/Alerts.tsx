import React, { useState } from 'react';
import { BellRing, Plus, Settings2, Mail, Webhook, Trash2, AlertTriangle, Info, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AlertRule } from '../types';

export const Alerts: React.FC = () => {
  const { alertRules, toggleAlertRule, deleteAlertRule, addAlertRule, notifications } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    condition: 'Weight Drop > 5%',
    action: 'Email to Analyst Team',
    active: true
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRule.name) {
      addAlertRule({
        id: Date.now().toString(),
        name: newRule.name,
        condition: newRule.condition!,
        action: newRule.action!,
        active: true
      });
      setIsModalOpen(false);
      setNewRule({ name: '', condition: 'Weight Drop > 5%', action: 'Email to Analyst Team', active: true });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Alerts & Triggers</h1>
          <p className="text-slate-400">Automate notifications when alternative data detects market anomalies.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-slate-400" /> Active Monitoring Rules
          </h3>
          
          {alertRules.map(rule => (
            <div key={rule.id} className={`p-5 rounded-2xl border transition-all ${rule.active ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-75'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-base font-medium text-white">{rule.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">Condition: <span className="text-emerald-400 font-mono">{rule.condition}</span></p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={rule.active} onChange={() => toggleAlertRule(rule.id)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${rule.active ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {rule.action.includes('Email') ? <Mail className="w-4 h-4" /> : <Webhook className="w-4 h-4" />}
                  {rule.action}
                </div>
                <button 
                  onClick={() => deleteAlertRule(rule.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {alertRules.length === 0 && (
            <div className="text-slate-500 text-sm p-4 border border-slate-800 rounded-xl text-center">
              No alert rules configured.
            </div>
          )}
        </div>

        {/* Recent Notifications Log */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-slate-400" /> Recent Triggers
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 max-h-[600px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No recent triggers.
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      notif.type === 'warning' ? 'bg-amber-500/10' : 
                      notif.type === 'success' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                    }`}>
                      {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : 
                       notif.type === 'success' ? <Webhook className="w-4 h-4 text-emerald-400" /> : 
                       <Info className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{notif.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                      <p className="text-[10px] text-slate-500 mt-2">{notif.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Create New Alert Rule</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateRule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Rule Name</label>
                <input 
                  required 
                  type="text" 
                  value={newRule.name} 
                  onChange={e => setNewRule({...newRule, name: e.target.value})} 
                  placeholder='e.g., "Major UNVR Shrinkflation Alert"'
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Condition Type</label>
                <select 
                  value={newRule.condition} 
                  onChange={e => setNewRule({...newRule, condition: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Weight Drop > 5%">Weight Drop &gt; 5%</option>
                  <option value="Price Increase > 10%">Price Increase &gt; 10%</option>
                  <option value="Margin Expansion > 5%">Margin Expansion &gt; 5%</option>
                  <option value="Any Shrinkflation Detected">Any Shrinkflation Detected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Action When Triggered</label>
                <select 
                  value={newRule.action} 
                  onChange={e => setNewRule({...newRule, action: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Email to Analyst Team">Email to Analyst Team</option>
                  <option value="Slack Webhook">Slack Webhook</option>
                  <option value="In-App Notification Only">In-App Notification Only</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">Create Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
