import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Plus, Terminal, Layers, Sparkles, Settings, LogOut, Home, Mic } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative z-50 h-full w-[280px] lg:w-[320px] bg-[#05070a]/90 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#348fc0]/10 border border-[#348fc0]/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(52,143,192,0.15)] relative group overflow-hidden">
              <Brain className="w-6 h-6 text-[#348fc0] relative z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[#348fc0]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h2 className="text-[24px] tracking-tight text-white">Brain.2</h2>
              <div className="text-xs text-[#348fc0] opacity-80">by NIXGN</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          <div className="px-4 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 mt-2">Memory Clusters</div>
          {[
            { name: "Home", icon: Home, route: "/send-ask" },
            { name: "Schedules", icon: Terminal, route: "/schedules" },
            { name: "Insights", icon: Layers, route: "/insights" },
            { name: "Storage History", icon: Sparkles, route: "/history" }
          ].map((item, i) => {
            const isActive = location.pathname.startsWith(item.route);
            return (
              <button
                key={i}
                onClick={() => { navigate(item.route); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all duration-300 group border ${isActive
                    ? 'bg-[#348fc0]/10 border-[#348fc0]/30 text-white shadow-[0_0_20px_rgba(52,143,192,0.1)]'
                    : 'bg-transparent border-transparent hover:bg-white/3 hover:border-white/5 text-white/50 hover:text-white'
                  }`}
              >
                <div className={`p-2.5 rounded-lg transition-colors duration-300 shadow-sm ${isActive
                    ? 'bg-[#348fc0]/20 text-[#348fc0]'
                    : 'bg-white/5 group-hover:bg-[#348fc0]/15 group-hover:text-[#348fc0]'
                  }`}>
                  <item.icon size={16} className="text-inherit" />
                </div>
                <span className="truncate text-[13px] tracking-tight">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Ambient Listening Toggle */}
        <div className="px-5 mb-2">
          <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-4 flex justify-between items-center group transition-all duration-300 hover:border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className={`p-2 rounded-xl transition-colors duration-300 ${isListening ? 'bg-[#348fc0]/20 text-[#348fc0] shadow-[0_0_15px_rgba(52,143,192,0.15)]' : 'bg-white/5 text-white/40'}`}>
                <Mic size={16} />
              </div>
              <div>
                <h3 className="text-[13px] font-medium text-white/90 tracking-wide">Ambient AI</h3>
                <p className="text-[10px] text-white/40 mt-0.5">Always-on listening</p>
              </div>
            </div>

            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-8 h-5 rounded-full relative transition-colors duration-300 flex items-center px-0.5 z-10 ${isListening ? 'bg-[#348fc0]' : 'bg-white/10'}`}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: isListening ? 12 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            {isListening && <div className="absolute inset-0 bg-[#348fc0]/5 z-0" />}
          </div>
        </div>

        {/* Footer Profile */}
        <div className="py-6 mt-auto">
          <div className="pt-2 px-4 border-t border-white/5 hover:border-white/10 transition-all duration-300 group shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className='flex items-center gap-2'>
                <div className="w-11 h-11 rounded-full bg-[#348fc0]/10 border border-[#348fc0]/20 flex items-center justify-center text-[#348fc0] font-bold text-xl shadow-[0_0_15px_rgba(52,143,192,0.15)]">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden flex flex-col">
                  <p className="font-medium text-white/90 text-[13px] tracking-wide truncate">{user?.fullName || 'User Context'}</p>
                  {isListening && (
                    <div className="flex items-center gap-1 pb-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,146,0.5)]" />
                      <p className="text-[9px] font-medium text-emerald-400/80 tracking-wider">Listening Active</p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleLogout} title="Disconnect" className="p-2.5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/15 transition-colors rounded-lg shrink-0"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;