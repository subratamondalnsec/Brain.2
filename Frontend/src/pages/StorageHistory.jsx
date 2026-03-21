import React, { useState } from 'react';
import { Menu, Sparkles, FolderArchive, ArrowUpRight, HardDrive, Database, Search } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import { motion } from 'framer-motion';

const StorageHistory = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const memories = [
    { title: 'Project Apollo Architecture', size: '24.5 MB', type: 'Design Specs', date: 'Oct 24, 2026', tags: ['System', 'Core'] },
    { title: 'Q3 Financial Models', size: '1.2 GB', type: 'Spreadsheets', date: 'Oct 22, 2026', tags: ['Finance', 'Data'] },
    { title: 'Neural Network Weights', size: '8.4 GB', type: 'Binary', date: 'Oct 19, 2026', tags: ['AI', 'Models'] },
    { title: 'User Identity Matrix', size: '342 KB', type: 'JSON Array', date: 'Oct 15, 2026', tags: ['Auth', 'Profiles'] },
    { title: 'Client Meeting Transcripts', size: '12 MB', type: 'Audio / Text', date: 'Oct 12, 2026', tags: ['Meetings'] },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-[#348fc0]/30 font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-linear-to-bl from-purple-500/10 to-transparent pointer-events-none z-0" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[130px] pointer-events-none z-0" />

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
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <Sparkles size={20} />
              </div>
              <h1 className="text-xl font-medium tracking-tight text-white/90">Storage History</h1>
            </div>
          </div>

          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-white/30 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input 
               type="text" 
               placeholder="Search archives..." 
               className="bg-[#0a0c10] border border-white/5 focus:border-purple-500/30 w-64 pl-9 pr-4 py-2 rounded-xl text-sm text-white/90 placeholder-white/30 outline-hidden transition-all duration-300 shadow-inner"
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 custom-scrollbar relative">
          <div className="max-w-5xl mx-auto space-y-8 pb-20">
            
            {/* Storage Usage Row */}
            <div className="bg-[#0a0c10]/80 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-500">
               <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-purple-500/5 to-transparent pointer-events-none" />
               <div className="flex flex-col gap-2 w-full md:w-1/3">
                 <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest">Total Used Space</h2>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl md:text-5xl font-light tracking-tighter text-white">412.5</span>
                   <span className="text-xl font-medium text-purple-400">GB</span>
                 </div>
                 <p className="text-xs text-white/30 mt-2">of 2.0 TB allocated storage limit</p>
               </div>
               
               <div className="w-full md:w-2/3 flex flex-col gap-4">
                 <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                   <div className="h-full bg-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out" style={{width: '60%'}}></div>
                   <div className="h-full bg-blue-400/80 shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-1000 ease-out" style={{width: '25%'}}></div>
                   <div className="h-full bg-emerald-400/80 transition-all duration-1000 ease-out" style={{width: '10%'}}></div>
                 </div>
                 <div className="flex items-center gap-6 text-xs font-medium">
                   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="text-white/50">Media (247 GB)</span></div>
                   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span><span className="text-white/50">Documents (103 GB)</span></div>
                   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span className="text-white/50">System (41 GB)</span></div>
                 </div>
               </div>
            </div>

            {/* Timelines */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <FolderArchive size={16} /> Recent Archives
                </h2>
                <button className="text-[11px] font-semibold text-white/50 uppercase tracking-widest hover:text-purple-400 transition-colors">View All</button>
              </div>

              <div className="bg-[#0a0c10]/40 border border-white/5 rounded-3xl p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 pt-4 pl-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Name</th>
                      <th className="pb-3 pt-4 px-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Date</th>
                      <th className="pb-3 pt-4 px-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Size</th>
                      <th className="pb-3 pt-4 pr-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {memories.map((mem, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                        <td className="py-4 pl-4 text-sm font-medium text-white/80">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-purple-400 transition-colors shrink-0">
                               <Database size={14} />
                            </div>
                            <div>
                               <p className="truncate text-[13px]">{mem.title}</p>
                               <div className="flex items-center gap-2 mt-1 md:hidden">
                                  <span className="text-[10px] text-white/30">{mem.date} • {mem.size}</span>
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-white/40 font-medium hidden md:table-cell">{mem.date}</td>
                        <td className="py-4 px-4 text-xs text-white/40 font-medium hidden lg:table-cell"><span className="bg-white/5 px-2 py-1 rounded-md tracking-wider border border-white/5">{mem.size}</span></td>
                        <td className="py-4 pr-4 text-right">
                          <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300">
                             <ArrowUpRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StorageHistory;
