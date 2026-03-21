import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, File, X, Paperclip, Image as ImageIcon, Camera, Send, Mic } from 'lucide-react';

function SendChat({
  chatContainerRef,
  chatHistory,
  toggleAudioPlay,
  playingAudioId,
  setFullScreenImage,
  chatEndRef,
  handleSendMessage,
  stagedFile,
  setStagedFile,
  showAttachMenu,
  setShowAttachMenu,
  handleAttachClick,
  isRecording,
  recordingTime,
  message,
  setMessage,
  mode,
  handleVoiceRecording
}) {
  return (
    <>
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
                                <span className="text-white/90 text-[15px] leading-relaxed wrap-break-word">{item.content}</span>
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
                                <span className="text-white/90 text-[15px] leading-relaxed wrap-break-word">{item.content}</span>
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
    </>
  );
}

export default SendChat;