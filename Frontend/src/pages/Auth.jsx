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
        navigate('/dashboard');
      } else {
        const data = await signupUser(formData);
        login(data.user, data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full glass-morphism rounded-[2.5rem] overflow-hidden relative z-10 border border-white/10 shadow-2xl">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-16 relative bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-r border-white/5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center relative"
          >
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl backdrop-blur-sm animate-float">
              <Brain className="w-12 h-12 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
            <h1 className="text-6xl font-black mb-6 tracking-tighter bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
              2ndBrain
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              Your intelligence, <span className="text-blue-400">augmented</span>. The next evolution of personal knowledge.
            </p>
            
            <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Neural</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Global</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <motion.div 
                key={isLogin ? 'login-head' : 'signup-head'}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-3"
              >
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">{isLogin ? 'Sign In' : 'Join Neural'}</h2>
              </motion.div>
              <p className="text-slate-400 font-medium">
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
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Identity</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        type="text" 
                        placeholder="Human Name"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Neural Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    type="email" 
                    placeholder="email@consciousness.io"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Access Key</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium flex gap-3 items-center"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </motion.div>
              )}

              <button 
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 rounded-2xl font-bold text-white shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {loading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">{isLogin ? 'Establish Link' : 'Initialize Brain'}</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shine_3s_infinite]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-6">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 group"
              >
                {isLogin ? "Need a neural network?" : "Already synchronized?"}
                <span className="text-blue-500 group-hover:underline">
                  {isLogin ? "Create One" : "Log In"}
                </span>
              </button>
              
              <div className="w-full flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-600">Secure Protocol v2</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
