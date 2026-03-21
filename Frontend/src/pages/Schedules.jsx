import React, { useState, useEffect } from 'react';
import { Menu, Calendar, Clock, ArrowRight, Play, CheckCircle2, ChevronRight, X, Filter } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import NewTask from '../components/Models/NewTask';
import { motion, AnimatePresence } from 'framer-motion';
import { getSchedules } from '../api/analytics';

const Schedules = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: '', date: '' });

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const res = await getSchedules();
        if (res.success && res.schedules) {
          const formatted = res.schedules.map(sch => ({
            id: sch._id,
            title: sch.topic,
            time: sch.time || 'All Day',
            date: sch.date,
            status: 'pending'
          }));
          setTasks(formatted);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    loadSchedules();
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    let displayTime = newTask.time || '12:00 PM';
    if (newTask.time) {
      const [hours, minutes] = newTask.time.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      displayTime = `${h12}:${minutes} ${ampm}`;
    }

    setTasks(prev => [...prev, {
      id: Date.now(),
      title: newTask.title,
      time: displayTime,
      date: newTask.date || selectedDate,
      status: 'pending'
    }]);
    
    setNewTask({ title: '', time: '', date: '' });
    setIsModalOpen(false);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    ));
  };

  const filteredTasks = tasks.filter(t => t.date === selectedDate);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;
    return 0; // maintain relative order
  });

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-[#348fc0]/30 font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-[#348fc0]/10 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#348fc0]/20 blur-[120px] pointer-events-none z-0" />

        {/* Modal Overlay */}
        <NewTask 
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          handleAddTask={handleAddTask}
          newTask={newTask}
          setNewTask={setNewTask}
        />

        {/* Header */}
        <header className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between z-10 bg-[#05070a]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Menu size={20} className="text-white/70" />
            </button>
            <h1 className="text-xl font-medium tracking-tight text-white/90">Brain.Schedules</h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white/5 hover:bg-[#348fc0]/20 text-[#348fc0] border border-[#348fc0]/30 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm flex items-center gap-2"
          >
            <Calendar size={16} />
            <span>Add Task</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mt-8 mb-6">
              <h2 className="text-sm font-medium text-white/70 tracking-wide uppercase shrink-0">
                {selectedDate === todayStr ? "Today's Schedule" : `Schedule for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
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

            <div className="space-y-3">
              <AnimatePresence>
                {sortedTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center border border-white/5 rounded-3xl bg-white/2"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Calendar size={20} className="text-white/40" />
                    </div>
                    <p className="text-sm text-white/50">No schedules found for this date.</p>
                  </motion.div>
                ) : (
                  sortedTasks.map((schedule) => (
                    <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={schedule.id}
                    onClick={() => toggleTask(schedule.id)}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300 ${
                      schedule.status === 'completed'
                        ? 'bg-[rgba(170,202,255,0.06)]'
                        : 'bg-[rgba(0,0,0,0.15)] border border-[rgba(170,202,255,0.20)] hover:border-[rgba(170,202,255,0.2)] hover:shadow-[0_4px_20px_-10px_rgba(52,143,192,0.1)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      schedule.status === 'completed'
                        ? 'border-[#348fc0]/60 bg-[#348fc0]/20'
                        : 'border-[rgba(170,202,255,0.5)]'
                    }`}>
                        {schedule.status === 'completed' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#348fc0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium leading-tight truncate transition-all duration-300 ${
                          schedule.status === 'completed' ? 'text-white/30 line-through' : 'text-white/60'
                        }`}>
                            {schedule.title}
                        </p>
                    </div>
                    <span className="text-[12px] font-medium text-[rgba(170,202,255,0.4)] shrink-0">{schedule.time}</span>
                  </motion.div>
                )))}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedules;
