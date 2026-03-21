import React, { useState } from 'react';
import { Menu, Filter, FolderArchive, ArrowUpRight, HardDrive, Database, Search, FileText, Image as ImageIcon, Video, Calendar } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const StorageHistory = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [files, setFiles] = useState([
    { id: 1, title: 'Project_Apollo_Blueprint.pdf', size: '24.5 MB', type: 'pdf', date: todayStr },
    { id: 2, title: 'Demo_Walkthrough.mp4', size: '1.2 GB', type: 'video', date: todayStr },
    { id: 3, title: 'UX_Wireframes_V2.png', size: '8.4 MB', type: 'image', date: todayStr },
    { id: 4, title: 'User_Research_Notes.pdf', size: '342 KB', type: 'pdf', date: todayStr },
    { id: 5, title: 'Quarterly_Sync.mp4', size: '412.1 MB', type: 'video', date: todayStr },
  ]);

  const filteredFiles = files.filter(f => f.date === selectedDate);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText size={14} />;
      case 'video': return <Video size={14} />;
      case 'image': return <ImageIcon size={14} />;
      default: return <Database size={14} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-[#348fc0]/30 font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-linear-to-bl from-[#348fc0]/10 to-transparent pointer-events-none z-0" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#348fc0]/20 blur-[130px] pointer-events-none z-0" />

        {/* Header */}
        <header className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between z-10 bg-[#05070a]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Menu size={20} className="text-white/70" />
            </button>
            <h1 className="text-xl font-medium tracking-tight text-white/90">Brain.Storage</h1>
          </div>

          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-white/30 group-focus-within:text-[#348fc0] transition-colors" />
            </div>
            <input 
               type="text" 
               placeholder="Search files..." 
               className="bg-[#0a0c10] border border-white/5 focus:border-[#348fc0]/50 w-64 pl-9 pr-4 py-2 rounded-xl text-sm text-white/90 placeholder-white/30 outline-hidden transition-all duration-300 shadow-inner"
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            
            {/* Storage Usage Row */}
            <div className="bg-[#0a0c10]/80 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-500">
               <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-[#348fc0]/5 to-transparent pointer-events-none" />
               <div className="flex flex-col gap-2 w-full md:w-1/3 z-10">
                 <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest">Total Used Space</h2>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl md:text-5xl font-light tracking-tighter text-white">412.5</span>
                   <span className="text-xl font-medium text-[#348fc0]">GB</span>
                 </div>
                 <p className="text-xs text-white/30 mt-2">of 2.0 TB allocated storage limit</p>
               </div>
               
               <div className="w-full md:w-2/3 flex flex-col gap-4 z-10">
                 <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                   <div className="h-full bg-[#348fc0]/80 shadow-[0_0_15px_rgba(52,143,192,0.5)] transition-all duration-1000 ease-out" style={{width: '60%'}}></div>
                   <div className="h-full bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,146,0.3)] transition-all duration-1000 ease-out" style={{width: '25%'}}></div>
                   <div className="h-full bg-amber-400/80 transition-all duration-1000 ease-out" style={{width: '10%'}}></div>
                 </div>
                 <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#348fc0]"></span><span className="text-white/50">Videos (247 GB)</span></div>
                   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span className="text-white/50">Documents (103 GB)</span></div>
                   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="text-white/50">Photos (41 GB)</span></div>
                 </div>
               </div>
            </div>

            {/* Timelines and Files */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-medium text-white/70 tracking-wide uppercase shrink-0">
                  {selectedDate === todayStr ? "Today's Uploads" : `Uploads on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </h2>
                
                <div className="flex items-center gap-2 relative bg-white/3 border border-white/10 hover:bg-white/6 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer group shadow-sm">
                  <Filter size={13} className="text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-[11px] uppercase tracking-wider text-white/60 font-medium outline-hidden cursor-pointer w-[105px] hover:text-white/90 transition-colors"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="bg-[#0a0c10]/40 border border-white/5 rounded-3xl p-2 min-h-[250px] relative">
                <AnimatePresence mode="wait">
                  {filteredFiles.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <FolderArchive size={20} className="text-white/40" />
                      </div>
                      <p className="text-sm text-white/50">No files uploaded on this date.</p>
                    </motion.div>
                  ) : (
                    <motion.table 
                      key="file-table"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full text-left border-collapse"
                    >
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="pb-3 pt-4 pl-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Name</th>
                          <th className="pb-3 pt-4 px-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Date</th>
                          <th className="pb-3 pt-4 px-4 text-[10px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Size</th>
                          <th className="pb-3 pt-4 pr-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFiles.map((file, i) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={file.id} 
                            className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                          >
                            <td className="py-4 pl-4 text-sm font-medium text-white/80">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-[#348fc0] group-hover:bg-[#348fc0]/10 transition-colors shrink-0">
                                   {getFileIcon(file.type)}
                                </div>
                                <div className="min-w-0">
                                   <p className="truncate text-[13px]">{file.title}</p>
                                   <div className="flex items-center gap-2 mt-1 md:hidden">
                                      <span className="text-[10px] text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm">{file.type}</span>
                                      <span className="text-[10px] text-white/30">{file.size}</span>
                                   </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs text-white/40 font-medium hidden md:table-cell">{file.date}</td>
                            <td className="py-4 px-4 text-xs text-white/40 font-medium hidden lg:table-cell">
                                <span className="bg-white/5 px-2 py-1.5 rounded-md tracking-wider border border-white/5 shadow-xs">{file.size}</span>
                            </td>
                            <td className="py-4 pr-4 text-right">
                              <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 border border-white/5 text-[#348fc0] hover:bg-[#348fc0]/20 hover:border-[#348fc0]/30 transition-all duration-300 shadow-sm">
                                 <ArrowUpRight size={14} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </motion.table>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StorageHistory;
