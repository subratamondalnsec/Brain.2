import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Plus, Terminal, Layers, Sparkles, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="p-7 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#348fc0]/10 border border-[#348fc0]/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(52,143,192,0.15)] relative group overflow-hidden">
               <Brain className="w-6 h-6 text-[#348fc0] relative z-10 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-[#348fc0]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h2 className="font-bold text-[19px] tracking-tight text-white mb-0.5">2ndBrain</h2>
              <div className="text-[9px] uppercase font-bold text-[#348fc0] tracking-[0.3em] opacity-80">Workspace v2</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Action Button */}
        <div className="px-6 mb-7 mt-2">
          <button className="w-full flex items-center justify-center gap-2.5 bg-transparent border border-[#348fc0]/30 hover:border-[#348fc0]/70 hover:bg-[#348fc0]/10 hover:shadow-[0_0_20px_rgba(52,143,192,0.15)] p-3.5 rounded-2xl font-semibold text-[#3facdf] active:scale-[0.98] transition-all duration-300 group overflow-hidden relative">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            New Neural Thread
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          <div className="px-4 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 mt-2">Memory Clusters</div>
          {[
            { name: "Project Architecture", icon: Terminal },
            { name: "Global Marketing", icon: Layers },
            { name: "Neural Vision 2026", icon: Sparkles }
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/3 border border-transparent hover:border-white/5 text-white/50 hover:text-white transition-all duration-300 group">
              <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#348fc0]/15 group-hover:text-[#348fc0] transition-colors duration-300 shadow-sm">
                <item.icon size={16} className="text-inherit" />
              </div>
              <span className="truncate text-[13px] font-medium tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer Profile */}
        <div className="p-6 mt-auto">
          <div className="bg-[#0a0c10] p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 group shadow-2xl relative overflow-hidden">
             <div className="flex items-center gap-3.5 relative z-10">
               <div className="w-11 h-11 rounded-2xl bg-[#348fc0]/10 border border-[#348fc0]/20 flex items-center justify-center text-[#348fc0] font-bold text-base shadow-[0_0_15px_rgba(52,143,192,0.15)]">
                 {user?.fullName?.charAt(0).toUpperCase() || 'U'}
               </div>
               <div className="overflow-hidden flex-1">
                 <p className="font-semibold text-white/90 text-[13px] tracking-wide truncate">{user?.fullName || 'User Context'}</p>
                 <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,146,0.5)]" />
                   <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider">Active Link</p>
                 </div>
               </div>
             </div>
             
             <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/5 relative z-10">
                <button title="Settings" className="p-2.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors rounded-xl"><Settings size={16} /></button>
                <button title="Nodes" className="p-2.5 text-white/40 hover:text-[#348fc0] hover:bg-[#348fc0]/15 transition-colors rounded-xl"><Layers size={16} /></button>
                <button onClick={handleLogout} title="Disconnect" className="p-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/15 transition-colors rounded-xl"><LogOut size={16} /></button>
             </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;