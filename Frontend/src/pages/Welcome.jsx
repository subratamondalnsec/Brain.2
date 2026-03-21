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
          navigate('/send-ask', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      }, 5000); // 5 seconds of cinematic bliss
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#000000]">
      {/* Background Video (Matching hero.tsx) */}
      <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda_poster.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
          <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
              type="video/mp4"
          />
      </video>

      {/* Overlay (Matching hero.tsx) */}
      <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center pt-[60px] pb-[60px] text-center w-full px-6 flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-[30px] max-w-[680px]"
          >
              {/* Badge (Matching hero.tsx) */}
              <div className="flex items-center gap-2 rounded-[20px] bg-[rgba(43,55,80,0.1)] px-4 py-1.5 backdrop-blur-lg shadow-[inset_0_0_0_1px_rgba(170,202,255,0.2),inset_0_0_16px_0_rgba(170,202,255,0.1),inset_0_-3px_12px_0_rgba(170,202,255,0.15),0_1px_3px_0_rgba(0,0,0,0.50),0_4px_12px_0_rgba(0,0,0,0.45)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#348fc0d1] shadow-[0_0_6px_rgba(160,217,248,0.6)] animate-pulse" />
                  <span className="text-[13px] font-medium tracking-widest">
                      <span className="text-[rgba(170,202,255,0.6)]">Ambient AI · </span>
                      <span className="text-white/50">Always On ·</span>
                      <span className="text-[rgba(170,202,255,0.6)]"> Neural Core</span>
                  </span>
              </div>

              {/* Heading Container */}
              <div className="flex flex-col items-center gap-[24px]">
                  {/* Heading (Matching hero.tsx typography) */}
                  <h1
                      className="text-[52px] md:text-[72px] font-medium leading-[1.1] max-w-[700px] tracking-tight select-none"
                      style={{
                          backgroundImage: "linear-gradient(144.5deg, #FFFFFF 28%, rgba(0, 0, 0, 0) 115%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          color: "transparent"
                      }}
                  >
                      Second <span style={{
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          WebkitTextStroke: "0.5px #348fc0d1",
                          backgroundClip: "text",
                          color: "transparent"
                      }}>Brain</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-[15px] font-normal text-white/50 max-w-[480px] leading-relaxed select-none">
                      Initializing secure neural pathways and syncing context environment...
                  </p>
              </div>

              {/* Progress Loading Indicator */}
              <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex gap-2.5">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        className="w-1.5 h-1.5 bg-[#348fc0] rounded-full"
                        animate={{ 
                          scale: [1, 1.8, 1], 
                          opacity: [0.2, 1, 0.2],
                          boxShadow: ["0 0 0px rgba(52,143,192,0)", "0 0 10px rgba(52,143,192,0.8)", "0 0 0px rgba(52,143,192,0)"]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>
              </div>
          </motion.div>
      </div>

      {/* Atmospheric Vignette matching hero overlay depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />
    </div>
  );
};

export default Welcome;
