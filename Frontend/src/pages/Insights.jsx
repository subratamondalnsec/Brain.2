import React, { useState } from 'react';
import { Menu, Layers, BarChart3, TrendingUp, Activity, FileText } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import { motion } from 'framer-motion';

const Insights = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-[#348fc0]/30 font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-emerald-500/10 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-emerald-500/10 blur-[120px] pointer-events-none z-0" />

        {/* Header */}
        <header className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between z-10 bg-[#05070a]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Menu size={20} className="text-white/70" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(52,211,146,0.1)]">
                <Layers size={20} />
              </div>
              <h1 className="text-xl font-medium tracking-tight text-white/90">Insights</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 custom-scrollbar relative">
          <div className="max-w-5xl mx-auto space-y-6 pb-20">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Neural Nodes', val: '4,204', inc: '+12%', icon: BarChart3 },
                { title: 'Data Processed', val: '18.4GB', inc: '+5%', icon: Activity },
                { title: 'Task Efficiency', val: '98.2%', inc: '+1.4%', icon: TrendingUp },
                { title: 'Context Files', val: '891', inc: '+24', icon: FileText }
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-[#0a0c10]/80 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 text-white/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                      <stat.icon size={18} />
                    </div>
                    <span className="text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{stat.inc}</span>
                  </div>
                  <h3 className="text-[13px] text-white/50 tracking-wide uppercase">{stat.title}</h3>
                  <div className="text-3xl font-light text-white/90 tracking-tight mt-1">{stat.val}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 bg-[#0a0c10]/60 border border-white/5 rounded-3xl p-6 min-h-[300px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px]" />
                <h3 className="text-sm font-medium text-white/80 tracking-wide uppercase mb-6 z-10">Neural Activity Flow</h3>
                
                <div className="flex-1 flex items-end gap-2 z-10 pb-4 mt-auto h-48 max-w-full overflow-x-auto custom-scrollbar-hide">
                  {/* Mock Chart */}
                  {Array.from({length: 24}).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group min-w-[12px]">
                      <div className="w-full bg-[#348fc0]/20 rounded-t-sm transition-all duration-300 group-hover:bg-[#348fc0] max-w-[20px]" style={{ height: `${20 + Math.random() * 80}%` }} />
                      <span className="text-[9px] text-white/30 hidden md:block">{i.toString().padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0c10]/60 border border-white/5 rounded-3xl p-6 flex flex-col">
                <h3 className="text-sm font-medium text-white/80 tracking-wide uppercase mb-6">Topic Distribution</h3>
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#101827" strokeWidth="16" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#348fc0" strokeWidth="16" strokeDasharray="160 251" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="60 251" strokeDashoffset="-160" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="30 251" strokeDashoffset="-220" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Total</span>
                      <span className="text-xl font-medium tracking-tight">100%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  {[
                    { label: 'Development', color: 'bg-[#348fc0]', pct: '64%' },
                    { label: 'Research', color: 'bg-emerald-500', pct: '24%' },
                    { label: 'Personal', color: 'bg-amber-500', pct: '12%' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                       <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${item.color}`} />
                         <span className="text-white/60">{item.label}</span>
                       </div>
                       <span className="text-white/90 font-medium">{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
