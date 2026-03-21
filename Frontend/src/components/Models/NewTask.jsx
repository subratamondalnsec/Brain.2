import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function NewTask({ isModalOpen, setIsModalOpen, handleAddTask, newTask, setNewTask }) {
  return (
    <AnimatePresence>
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setIsModalOpen(false)}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
           />
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="relative w-full max-w-md bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
           >
             <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#348fc0]/0 via-[#348fc0] to-[#348fc0]/0" />
             
             <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-white/90 tracking-tight">Schedule New Task</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors border border-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50 tracking-wide uppercase px-1">Task Title</label>
                    <input 
                      type="text"
                      required
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="e.g. Review Q4 Report"
                      className="w-full bg-[#030508] border border-white/10 focus:border-[#348fc0]/50 rounded-xl px-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 tracking-wide uppercase px-1">Date</label>
                      <input 
                        type="date"
                        required
                        value={newTask.date}
                        onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                        className="w-full bg-[#030508] border border-white/10 focus:border-[#348fc0]/50 rounded-xl px-4 py-3 text-sm text-white/90 outline-none transition-all duration-300"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 tracking-wide uppercase px-1">Time</label>
                      <input 
                        type="time"
                        required
                        value={newTask.time}
                        onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                        className="w-full bg-[#030508] border border-white/10 focus:border-[#348fc0]/50 rounded-xl px-4 py-3 text-sm text-white/90 outline-none transition-all duration-300"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-[#348fc0]/10 hover:bg-[#348fc0]/20 text-[#348fc0] border border-[#348fc0]/30 rounded-xl font-medium py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(52,143,192,0.1)] hover:shadow-[0_0_20px_rgba(52,143,192,0.2)]"
                    >
                      Schedule Task
                    </button>
                  </div>
                </form>
             </div>
           </motion.div>
         </div>
      )}
    </AnimatePresence>
  );
}

export default NewTask;