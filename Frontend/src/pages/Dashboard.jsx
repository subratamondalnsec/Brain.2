import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Send, Mic, Image as ImageIcon, 
  Settings, LogOut, Brain, Plus, Zap, HelpCircle, 
  CircleUser, Layers, Terminal, Sparkles, Paperclip, Play, Video, Camera, File, Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState('send'); // 'send' or 'ask'
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [fullScreenImage, setFullScreenImage] = useState(null);
  const playingAudioRef = useRef(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const [stagedFile, setStagedFile] = useState(null);

  const [chatHistory, setChatHistory] = useState([
    { id: 1, role: 'assistant', type: 'text', content: `Neural link established. Welcome back, ${user?.fullName?.split(' ')[0] || 'Explorer'}. I've synthesized your recent activity into the core memory node.` }
  ]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          recordingTimeRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const userMsg = { 
          id: Date.now(), 
          role: 'user', 
          type: 'audio', 
          url: audioUrl,
          duration: recordingTimeRef.current 
        };
        
        setChatHistory(prev => [...prev, userMsg]);
        
        setTimeout(() => {
          setChatHistory(prev => [...prev, { 
            id: Date.now() + 1, 
            role: 'assistant', 
            type: 'text',
            content: "Audio context successfully saved to your memory and analyzed." 
          }]);
        }, 1500);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic: ", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
      setShowCamera(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      
      setStagedFile({ 
        type: 'image', 
        url: dataUrl, 
        name: 'camera-photo.jpg' 
      });
      closeCamera();
    }
  };

  const handleAttachClick = (type) => {
    setShowAttachMenu(false);
    if (type === 'image') imageInputRef.current?.click();
    else if (type === 'document') docInputRef.current?.click();
    else if (type === 'camera') openCamera();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create object URL to display natively
    const url = URL.createObjectURL(file);
    const msgType = type === 'document' ? 'document' : 'image';
    
    setStagedFile({ 
      type: msgType, 
      url, 
      name: file.name,
      file
    });
    
    e.target.value = null;
  };

  const toggleAudioPlay = (url, id) => {
    if (playingAudioId === id) {
        playingAudioRef.current?.pause();
        setPlayingAudioId(null);
    } else {
        if (playingAudioRef.current) {
            playingAudioRef.current.pause();
        }
        const audio = new Audio(url);
        playingAudioRef.current = audio;
        setPlayingAudioId(id);
        
        audio.onended = () => {
            setPlayingAudioId(null);
        };
        audio.play().catch(e => console.error("Playback failed: ", e));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() && !stagedFile) return;
    
    if (stagedFile) {
      const userMsg = { 
        id: Date.now(), 
        role: 'user', 
        type: stagedFile.type, 
        url: stagedFile.url, 
        name: stagedFile.name,
        content: message.trim() || undefined
      };
      setChatHistory(prev => [...prev, userMsg]);
      setStagedFile(null);
      setMessage('');
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          type: 'text',
          content: stagedFile.type === 'image'
            ? "Image analyzed. Visual context successfully saved to your memory." 
            : `Document '${stagedFile.name}' processed. Relevant information extracted to your neural core.`
        }]);
      }, 1500);
    } else {
      const userMsg = { id: Date.now(), role: 'user', type: 'text', content: message };
      setChatHistory(prev => [...prev, userMsg]);
      setMessage('');
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          type: 'text',
          content: mode === 'ask' 
            ? "Brain analysis complete. I've identified 3 cross-connections in your neural archives related to this query." 
            : "Context captured. Memory node encrypted and distributed across the neural network."
        }]);
      }, 1500);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans overflow-hidden">
      <input type="file" accept="image/*,video/*" ref={imageInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
      <input type="file" accept=".pdf,.doc,.docx,.txt" ref={docInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'document')} />
      
      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
          >
             <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-4 right-4 z-[70]">
                  <button 
                    onClick={closeCamera}
                    className="p-2 bg-black/50 hover:bg-white/10 backdrop-blur-md rounded-full text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <video ref={videoRef} autoPlay playsInline className="w-full h-[60vh] md:h-[500px] object-cover bg-black scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-6 left-0 right-0 gap-4 flex justify-center items-center z-50">
                   <button 
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform border-4 border-[#0a0c10]"
                   >
                      <div className="w-14 h-14 rounded-full border-2 border-black" />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setFullScreenImage(null)}
          >
            <button 
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-60 text-white"
                onClick={() => setFullScreenImage(null)}
            >
                <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullScreenImage} 
              alt="Full Screen Popup" 
              className="max-w-full max-h-full rounded-lg object-contain relative z-50"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Premium Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed lg:relative z-50 h-full w-80 bg-white/2 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative group overflow-hidden">
               <Brain className="w-6 h-6 text-blue-500 relative z-10 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tighter text-white">2ndBrain</h2>
              <div className="text-[10px] uppercase font-bold text-blue-500 tracking-[0.2em] opacity-80">Neural Core v2</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 mb-8">
          <button className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 p-4 rounded-2xl font-bold text-white shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all group overflow-hidden relative">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            New Neural Thread
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shine_2s_infinite]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <div className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Memory Clusters</div>
          {[
            { name: "Project Architecture", icon: Terminal, color: "text-blue-500" },
            { name: "Global Marketing", icon: Layers, color: "text-purple-500" },
            { name: "Neural Vision 2026", icon: Sparkles, color: "text-cyan-500" }
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/3 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all group">
              <div className={`p-2 rounded-lg bg-white/5 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={16} />
              </div>
              <span className="truncate text-sm font-semibold">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="glass-morphism p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-black text-lg shadow-xl relative overflow-hidden">
                 {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                 <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
               </div>
               <div className="overflow-hidden">
                 <p className="font-bold text-white text-sm truncate">{user?.fullName || 'User Context'}</p>
                 <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Link</p>
                 </div>
               </div>
             </div>
             <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <button title="Settings" className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><Settings size={18} /></button>
                <button title="Nodes" className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><Layers size={18} /></button>
                <button onClick={handleLogout} title="Disconnect" className="p-2 text-slate-500 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-xl"><LogOut size={18} /></button>
             </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Flashy Bottom Ambient Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-[#348fc0]/20 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#348fc0]/40 blur-[100px] pointer-events-none z-0" />

        {/* Header */}
        <header className="shrink-0 px-4 lg:px-8 min-h-[72px] flex items-center justify-between border-b border-white/5 relative z-30 bg-[#030508]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-white/80 text-lg tracking-tight font-medium hidden sm:block">Brain.Storage</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
            <button 
                onClick={() => setMode('send')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${mode === 'send' ? 'bg-[#348fc0] text-white shadow-[0_0_15px_rgba(52,143,192,0.4)]' : 'text-white/40 hover:text-white/70'}`}
            >
                <Zap size={14} /> SEND
            </button>
            <button 
                onClick={() => setMode('ask')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${mode === 'ask' ? 'bg-[#348fc0] text-white shadow-[0_0_15px_rgba(52,143,192,0.4)]' : 'text-white/40 hover:text-white/70'}`}
            >
                <HelpCircle size={14} /> ASK
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#348fc0]/10 border border-[#348fc0]/20">
            <div className="w-2 h-2 rounded-full bg-[#348fc0] animate-pulse shadow-[0_0_5px_rgba(52,143,192,0.8)]" />
            <span className="text-[#348fc0] text-[10px] font-bold tracking-wider uppercase hidden sm:block">Active</span>
          </div>
        </header>

        {/* Chat Body */}
        <div 
            ref={chatContainerRef}
            className="flex-1 h-full min-h-0 overflow-y-auto px-4 lg:px-12 pt-4 pb-32 lg:pb-40 flex flex-col gap-4 relative z-10 w-full custom-scrollbar"
        >
            <div className="w-full flex justify-center mb-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm text-white/40 text-[10px] uppercase tracking-wider font-semibold border border-white/5">Today</span>
            </div>

            {chatHistory.map((item) => {
              if (item.type === 'audio') {
                return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="flex justify-end w-full mt-1 relative z-10">
                    <div className="w-[85%] md:w-[50%] rounded-2xl rounded-tr-sm bg-white/5 border border-white/10 p-3 backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-3">
                            <div 
                               onClick={() => toggleAudioPlay(item.url, item.id)}
                               className="w-10 h-10 rounded-full bg-[#348fc0] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(52,143,192,0.5)] cursor-pointer hover:scale-105 transition-transform"
                            >
                                {playingAudioId === item.id ? (
                                    <div className="w-3 h-3 bg-white rounded-sm" />
                                ) : (
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center h-6 w-full px-2">
                                    {[12, 16, 10, 18, 14, 8, 16, 12, 14, 8, 10, 6, 8, 4, 12, 16, 10, 8, 14].map((h, i) => (
                                        <div key={i} className={`w-[3px] rounded-full ${playingAudioId === item.id ? 'bg-white animate-pulse' : 'bg-[#348fc0]'}`} style={{ height: `${h}px`, opacity: i > 12 ? 0.3 : 1 }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 px-1 opacity-70">
                            <span className="text-[10px] text-[#348fc0] font-medium">0:{item.duration < 10 ? `0${item.duration}` : item.duration}</span>
                            <span className="text-[10px] text-[#348fc0] font-medium uppercase tracking-wider">
                               {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                 </motion.div>
                );
              }

              if (item.type === 'document') {
                return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="flex justify-end w-full mt-1 relative z-10">
                    <div 
                        onClick={() => window.open(item.url, '_blank')}
                        className="max-w-[85%] md:max-w-[70%] rounded-2xl p-3 rounded-tr-sm bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.2)] cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                <File size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-white/90 font-medium line-clamp-1">{item.name}</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">PDF Document</span>
                            </div>
                        </div>
                        {item.content && (
                            <div className="mt-3 px-1">
                                <span className="text-white/90 text-[15px] leading-relaxed break-words">{item.content}</span>
                            </div>
                        )}
                        <div className="flex justify-end opacity-70 mt-2">
                             <span className="text-[10px] text-[#348fc0] font-medium uppercase tracking-wider">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                         </div>
                    </div>
                 </motion.div>
                );
              }

              if (item.type === 'image') {
                return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="flex justify-end w-full mt-1 relative z-10">
                    <div className="max-w-[85%] md:max-w-[70%] rounded-2xl p-2 rounded-tr-sm bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                        <div className="w-full sm:w-64 h-48 rounded-xl bg-[#0a0c10]/50 border border-white/5 relative overflow-hidden flex items-center justify-center group cursor-zoom-in">
                            <img 
                                src={item.url}
                                alt="Attachment"
                                onClick={() => setFullScreenImage(item.url)}
                                className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:opacity-100 hover:mix-blend-normal hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-linear-to-tr from-[#348fc0]/30 to-transparent mix-blend-overlay pointer-events-none" />
                        </div>
                        {item.content && (
                            <div className="px-2 pt-3 pb-1">
                                <span className="text-white/90 text-[15px] leading-relaxed break-words">{item.content}</span>
                            </div>
                        )}
                        <div className="flex justify-end pr-2 pt-2 opacity-70">
                            <span className="text-[10px] text-[#348fc0] font-medium uppercase tracking-wider">
                               {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                 </motion.div>
                );
              }

              return (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.3 }}
                 key={item.id} 
                 className={`flex w-full ${item.role === 'user' ? 'justify-end' : 'justify-start'} mt-1 relative z-10`}
               >
                 <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex flex-col gap-1.5 ${
                    item.role === 'user' 
                    ? 'rounded-tr-sm bg-white/5 border border-white/10' 
                    : 'rounded-tl-sm bg-[#348fc0]/10 border border-[#348fc0]/30'
                 }`}>
                     <span className="text-white/90 text-[15px] leading-relaxed">
                         {item.content || item.text}
                     </span>
                     <div className={`flex opacity-70 mt-1 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <span className="text-[10px] text-[#348fc0] font-medium uppercase tracking-wider">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                     </div>
                 </div>
               </motion.div>
              );
            })}
            <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 lg:px-8 pt-16 pb-4 bg-linear-to-t from-[#030508] via-[#030508]/95 to-transparent z-40 flex items-end">
            <form onSubmit={handleSendMessage} className="w-full max-w-4xl mx-auto flex flex-col gap-3 pointer-events-auto relative">
                
                <AnimatePresence>
                    {stagedFile && (
                        <motion.div 
                           initial={{ opacity: 0, y: 20, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 20, scale: 0.95 }}
                           className="w-full max-w-sm ml-auto mr-auto sm:ml-0 sm:mr-0 bg-[#0a0c10]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <button 
                                type="button" 
                                onClick={() => setStagedFile(null)}
                                className="absolute -top-3 -right-3 p-1.5 bg-red-500 hover:bg-red-400 rounded-full text-white transition-colors z-10 shadow-lg"
                            >
                                <X size={16} />
                            </button>
                            
                            {stagedFile.type === 'image' ? (
                                <div className="w-full h-48 rounded-2xl overflow-hidden relative">
                                    <img src={stagedFile.url} className="w-full h-full object-cover opacity-90" alt="Preview"/>
                                </div>
                            ) : (
                                <div className="w-full h-32 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center p-4">
                                    <File size={32} className="text-purple-400 mb-2" />
                                    <span className="text-white/80 font-medium text-sm text-center line-clamp-2">{stagedFile.name}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex w-full items-end gap-3">
                    <div className="flex-1 min-h-[48px] bg-white/5 border border-white/10 transition-colors rounded-3xl flex items-center px-2 gap-2 backdrop-blur-md focus-within:border-[#348fc0]/50 focus-within:bg-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                        
                        <div className="relative flex items-center justify-center p-2">
                            <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="outline-none">
                                <Paperclip className="w-5 h-5 text-white/40 cursor-pointer hover:text-white/80 transition-colors" />
                            </button>
                            
                            <AnimatePresence>
                                {showAttachMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        className="absolute bottom-14 left-0 w-56 bg-[#0a0c10]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-1"
                                    >
                                        <button type="button" onClick={() => handleAttachClick('image')} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/80 hover:text-white text-sm">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0"><ImageIcon size={16} /></div>
                                            <span className="font-medium">Photos & Videos</span>
                                        </button>
                                        <button type="button" onClick={() => handleAttachClick('document')} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/80 hover:text-white text-sm">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0"><File size={16} /></div>
                                            <span className="font-medium">Document</span>
                                        </button>
                                        <button type="button" onClick={() => handleAttachClick('camera')} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/80 hover:text-white text-sm">
                                            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0"><Camera size={16} /></div>
                                            <span className="font-medium">Camera</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {isRecording ? (
                            <div className="flex-1 flex items-center gap-3 text-red-500 px-2 py-3 animate-pulse">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="font-mono font-bold tracking-widest">{`00:${recordingTime < 10 ? '0' : ''}${recordingTime}`}</span>
                                <span className="text-white/40 text-sm ml-2">Recording...</span>
                            </div>
                        ) : (
                            <input 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={stagedFile ? "Add a caption..." : (mode === 'ask' ? "Message..." : "Message...")}
                                className="bg-transparent text-white/90 text-[15px] font-medium flex-1 placeholder:text-white/40 outline-none w-full py-3"
                            />
                        )}
                    </div>
                    
                    {message.trim() || stagedFile ? (
                        <button 
                            type="submit"
                            className="w-12 h-12 rounded-full bg-[#348fc0] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(52,143,192,0.5)] cursor-pointer hover:bg-[#3facdf] active:scale-95 transition-all text-[#030508]"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                ) : (
                    <button 
                        type="button"
                        onClick={handleVoiceRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all ${
                           isRecording ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-400 text-white' : 'bg-[#348fc0] shadow-[0_0_15px_rgba(52,143,192,0.5)] hover:bg-[#3facdf] text-[#030508]'
                        }`}
                    >
                        {isRecording ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                )}
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
