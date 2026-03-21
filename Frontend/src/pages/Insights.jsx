import React, { useState, useEffect } from 'react';
import { Menu, Filter, Sparkles, Target, Zap, Network, Calendar } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalytics } from '../api/analytics';

const Insights = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getAnalytics(selectedDate);
        if (res.success && res.analytics && res.analytics.length > 0) {
          const doc = res.analytics[0]; // doc for this date
          const loaded = doc.insights.map((ins, index) => ({
            id: ins._id,
            date: selectedDate,
            type: 'knowledge',
            icon: Sparkles,
            title: ins.title || `Extracted Insight #${ins.number || index + 1}`,
            content: ins.text,
            tags: ['AI MEMORY']
          }));
          setInsights(loaded);
        } else {
          setInsights([]); 
        }
      } catch (err) {
        console.error("Failed fetching insights", err);
      }
    };
    fetchInsights();
  }, [selectedDate]);

  const filteredInsights = insights.filter(i => i.date === selectedDate);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-[#348fc0]/30 font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-[#348fc0]/10 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#348fc0]/20 blur-[120px] pointer-events-none z-0" />

        {/* Header */}
        <header className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between z-10 bg-[#05070a]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Menu size={20} className="text-white/70" />
            </button>
            <h1 className="text-xl font-medium tracking-tight text-white/90">Brain.Insights</h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mt-8 mb-6">
              <h2 className="text-sm font-medium text-white/70 tracking-wide uppercase shrink-0">
                {selectedDate === todayStr ? "Today's Insights" : `Insights for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </h2>
              
              <div className="flex items-center gap-2 relative bg-white/3 border border-white/10 hover:bg-white/6 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer group shadow-sm">
                <Filter size={13} className="text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
                <input 
                  type="date" 
                  max={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-[11px] uppercase tracking-wider text-white/60 font-medium outline-hidden cursor-pointer w-[105px] hover:text-white/90 transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredInsights.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center border border-white/5 rounded-3xl bg-white/2"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Sparkles size={20} className="text-white/40" />
                    </div>
                    <p className="text-sm text-white/50">No conversation insights recovered for this date.</p>
                  </motion.div>
                ) : (
                  filteredInsights.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        key={insight.id}
                        className="bg-[rgba(0,0,0,0.15)] border border-[rgba(170,202,255,0.08)] hover:border-[rgba(170,202,255,0.2)] hover:shadow-[0_4px_20px_-10px_rgba(52,143,192,0.1)] rounded-2xl p-6 transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-5">
                          <div className="w-10 h-10 rounded-full border border-[rgba(170,202,255,0.15)] bg-white/5 flex items-center justify-center shrink-0 transition-colors text-white/40 group-hover:border-[#348fc0]/40 group-hover:text-[#348fc0] group-hover:bg-[#348fc0]/10">
                              <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                              <h3 className="text-[15px] font-medium leading-tight text-white/90 mb-2">{insight.title}</h3>
                              <p className="text-[14px] leading-relaxed text-white/50">{insight.content}</p>
                              
                              {insight.tags && (
                                <div className="flex items-center flex-wrap gap-2 mt-4">
                                  {insight.tags.map(tag => (
                                     <span key={tag} className="text-[10px] font-medium tracking-widest uppercase text-[#348fc0]/70 bg-[#348fc0]/10 px-2 py-1 rounded-md border border-[#348fc0]/20">{tag}</span>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;;
