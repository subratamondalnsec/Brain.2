import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/dashboard');
        } else {
          navigate('/auth');
        }
      }, 5000); // 5 seconds of cinematic bliss
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020617] overflow-hidden relative">
      {/* Deep Neural Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)]" />
      
      {/* Dynamic Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2.5s' }} />

      {/* Complex Neural Particle System */}
      <div className="absolute inset-0 z-0">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full pointer-events-none`}
            style={{
              width: i % 5 === 0 ? '3px' : '1px',
              height: i % 5 === 0 ? '3px' : '1px',
              background: i % 3 === 0 ? '#3b82f6' : i % 2 === 0 ? '#8b5cf6' : '#fff',
              boxShadow: i % 5 === 0 ? '0 0 10px rgba(59,130,246,0.8)' : 'none',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              y: [0, (Math.random() - 0.5) * 200],
              x: [0, (Math.random() - 0.5) * 200],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{ 
              duration: Math.random() * 10 + 5, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* The Core */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0, filter: 'blur(20px)' }}
           animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
           transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
           className="relative"
        >
          {/* Pulsing Neural Aura */}
          <motion.div 
            className="absolute inset-[-40px] bg-blue-500/20 blur-[80px] rounded-full"
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative flex flex-col items-center">
             <motion.div
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             >
               <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-white select-none relative z-10">
                 2B<span className="text-blue-500 text-glow">.</span>
               </h1>
             </motion.div>
             <motion.div 
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: '100%', opacity: 1 }}
               transition={{ delay: 1, duration: 1.5 }}
               className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-[-10px] md:mt-[-20px] shadow-[0_0_20px_rgba(59,130,246,0.5)]"
             />
          </div>
        </motion.div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <h2 className="text-2xl font-bold tracking-[0.3em] uppercase text-white/90">2ndBrain</h2>
            <div className="flex items-center gap-4">
               <div className="h-[1px] w-8 bg-white/10" />
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Neural Extension</p>
               <div className="h-[1px] w-8 bg-white/10" />
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <div className="mt-8 flex flex-col items-center gap-3">
             <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.8, 1], 
                      opacity: [0.2, 1, 0.2],
                      boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 10px rgba(59,130,246,0.8)", "0 0 0px rgba(59,130,246,0)"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
             </div>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0.5] }}
               transition={{ delay: 3, duration: 2, repeat: Infinity }}
               className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]"
             >
               Syncing Neural Pathways...
             </motion.p>
          </div>
        </div>
      </div>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      
      {/* Decorative Lines */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
    </div>
  );
};

export default Welcome;
