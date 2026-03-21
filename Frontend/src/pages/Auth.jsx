import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight, Loader, Brain } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const data = await loginUser({ email: formData.email, password: formData.password });
        login(data.user, data.token);
        navigate('/send-ask');
      } else {
        const data = await signupUser(formData);
        login(data.user, data.token);
        navigate('/send-ask');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-6 bg-[#000000]">
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

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none backdrop-blur-[2px]" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />

      {/* Main Glass Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-[rgba(10,12,16,0.5)] backdrop-blur-2xl rounded-2xl overflow-hidden relative z-20 border border-[rgba(170,202,255,0.1)] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-16 relative border-r border-[rgba(170,202,255,0.05)] bg-linear-to-br from-[#348fc0]/5 to-transparent">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center relative flex flex-col items-center"
          >
            {/* Badge */}
            <div className="flex items-center gap-2 rounded-[20px] bg-[rgba(43,55,80,0.2)] px-4 py-1.5 backdrop-blur-lg shadow-[inset_0_0_0_1px_rgba(170,202,255,0.2)] mb-10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#348fc0d1] shadow-[0_0_6px_rgba(160,217,248,0.6)] animate-pulse" />
                <span className="text-[12px] font-medium tracking-widest text-white/70">
                    NETWORK SECURED
                </span>
            </div>

            <h1
                className="text-6xl font-medium leading-[1.1] tracking-tight text-transparent select-none mb-6"
                style={{
                    backgroundImage: "linear-gradient(144.5deg, #FFFFFF 28%, rgba(0, 0, 0, 0) 115%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                }}
            >
                <span className="font-medium" style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    WebkitTextStroke: "1px #348fc0d1",
                    backgroundClip: "text",
                    color: "transparent"
                }}>Brain.2</span>
            </h1>
            
            <p className="text-[15px] text-white/50 font-medium max-w-xs mx-auto leading-relaxed">
              Your intelligence, <span className="text-[#348fc0]">augmented</span>. The next evolution of personal knowledge.
            </p>
            
            <div className="mt-16 flex items-center justify-center gap-8 opacity-40">
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#348fc0] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#348fc0]">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">Neural</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#348fc0] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#348fc0]">Global</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center relative bg-[rgba(5,7,10,0.6)]">
          <div className="max-w-md w-full mx-auto relative z-10">
            <div className="mb-10">
              <motion.div 
                key={isLogin ? 'login-head' : 'signup-head'}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-3"
              >
                <div className="p-2 bg-white/5 rounded-lg border border-[rgba(170,202,255,0.1)] text-[#348fc0] shadow-inner flex items-center justify-center shrink-0 w-11 h-11">
                  {isLogin ? <LogIn size={18} /> : <Brain size={18} />}
                </div>
                <h2 className="text-3xl font-medium tracking-tight text-white/90">{isLogin ? 'Sign In' : 'Get Brain.2'}</h2>
              </motion.div>
              <p className="text-white/40 text-[15px]">
                {isLogin ? 'Return to your digital consciousness.' : 'Start building your decentralized neural network today.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-[14px] tracking-tight text-white/50 ml-1">Your Name</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#348fc0] transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        type="text" 
                        placeholder="Full Name"
                        className="w-full bg-[#030508] border border-[rgba(170,202,255,0.25)] rounded-xl py-3 pl-12 pr-4 text-white/90 placeholder:text-white/30 outline-none focus:border-[#348fc0]/50 transition-all shadow-inner"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[14px] tracking-tight text-white/50 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#348fc0] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    type="email" 
                    placeholder="email@consciousness.io"
                    className="w-full bg-[#030508] border border-[rgba(170,202,255,0.25)] rounded-xl py-3 pl-12 pr-4 text-white/90 placeholder:text-white/30 outline-none focus:border-[#348fc0]/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] tracking-tight text-white/50 ml-1">Access Key</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#348fc0] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-[#030508] border border-[rgba(170,202,255,0.25)] rounded-xl py-3 pl-12 pr-4 text-white/90 placeholder:text-white/30 outline-none focus:border-[#348fc0]/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex gap-3 items-center"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                  {error}
                </motion.div>
              )}

              <button 
                disabled={loading}
                className="w-full h-14 mt-2 bg-linear-to-r from-[#348fc0]/20 to-[#348fc0]/10 hover:from-[#348fc0]/30 hover:to-[#348fc0]/20 active:scale-[0.98] disabled:opacity-50 border border-[#348fc0]/30 rounded-xl text-[#348fc0] shadow-[0_0_15px_rgba(52,143,192,0.15)] hover:shadow-[0_0_25px_rgba(52,143,192,0.25)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin text-[#348fc0]" />
                ) : (
                  <>
                    <span className="relative z-10 font-medium tracking-wide">{isLogin ? 'Sign In' : 'Sign Up'}</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-6">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[13px] text-white/40 hover:text-white/60 transition-colors flex items-center gap-2 group"
              >
                {isLogin ? "Need another Brain?" : "Already have an account?"}
                <span className="text-[#348fc0] group-hover:underline">
                  {isLogin ? "Create One" : "Log In"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
