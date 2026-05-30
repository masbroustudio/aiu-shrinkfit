import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Webhook, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const NotificationBell: React.FC = () => {
  const { notifications } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.length; // In a real app, track read/unread status

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850 shrink-0">
            <h3 className="font-semibold text-white">Notifications</h3>
            <span className="text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
              {unreadCount} New
            </span>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No recent notifications.
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
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
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-slate-800 bg-slate-850 shrink-0 text-center">
            <button className="text-xs text-brand-400 hover:text-brand-300 font-medium">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
