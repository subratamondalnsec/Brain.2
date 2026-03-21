import React, { useState } from "react";
import { Bot, Mic, MicOff, X, ChevronDown, MoreHorizontal, Settings, FileText, Share, RefreshCcw, MessageSquare, Send } from "lucide-react";

function AskChat() {
    const [isListening, setIsListening] = useState(true);
    const [isEnded, setIsEnded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, sender: "user", text: "Hey, can you help me prepare for my upcoming interview for a frontend role?" },
        { id: 2, sender: "bot", text: "Absolutely! We can do a mock interview right now. Do you want to focus on React, generic web concepts, or algorithms?" }
    ]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        
        const newUserMsg = { id: Date.now(), sender: "user", text: inputValue.trim() };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        
        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: "Processing your input..." }]);
        }, 1200);
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col relative z-20 overflow-hidden text-white bg-transparent">
            {/* Clean Background Deep Glow */}
            <div className="absolute inset-0 bg-linear-to-b from-[#348fc0]/5 to-transparent pointer-events-none" />
       
            {/* Transcript View Overlay */}
            <div className={`absolute inset-0 top-24 bottom-32 px-5 overflow-y-auto flex flex-col gap-5 z-10 transition-all duration-500 ease-in-out scrollbar-hide ${showTranscript ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                {messages.map((msg, index) => (
                    msg.sender === "user" ? (
                        <div key={msg.id} className="flex flex-col gap-1.5 w-[85%] self-end items-end animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}>
                            <span className="text-white/40 text-[11px] font-medium pr-3">You</span>
                            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 text-white/80 text-sm leading-relaxed">
                                {msg.text}
                            </div>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex flex-col gap-1.5 w-[90%] self-start items-start animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}>
                            <span className="text-[#348fc0] text-[11px] font-medium pl-3">Second Brain</span>
                            <div className="backdrop-blur-md bg-[#348fc0]/10 border border-[#348fc0]/20 rounded-2xl rounded-tl-sm px-4 py-3 text-white/90 text-sm leading-relaxed">
                                {msg.text}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Elegant Professional Monochromatic Orb */}
            <div className={`absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] flex items-center justify-center select-none pointer-events-none transition-all duration-700 ease-in-out ${showTranscript ? 'opacity-0 scale-50 translate-y-24' : (isListening ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale')}`}>
                {/* Deep ambient base */}
                <div className="absolute inset-0 rounded-full bg-[#348fc0] blur-[80px] opacity-20" />

                {/* Outer smooth aura */}
                <div className={`absolute inset-4 rounded-[40%_60%_60%_40%/50%_50%_50%_50%] border-[0.5px] border-[#348fc0]/30 bg-[#348fc0]/5 blur-sm mix-blend-screen ${isListening ? 'animate-[spin_12s_linear_infinite]' : ''}`} />

                {/* Middle flowing visual */}
                <div className={`absolute inset-8 rounded-[60%_40%_30%_70%/50%_60%_40%_50%] bg-linear-to-tr from-[#348fc0]/50 to-transparent blur-lg mix-blend-screen ${isListening ? 'animate-[spin_8s_linear_infinite_reverse]' : ''}`} />

                {/* Inner fluid core */}
                <div className={`absolute inset-14 rounded-[45%_55%_65%_35%/55%_45%_60%_40%] bg-linear-to-bl from-[#348fc0]/80 via-[#348fc0]/30 to-transparent blur-md mix-blend-screen ${isListening ? 'animate-[spin_5s_linear_infinite]' : ''}`} />

                {/* Core intense energy */}
                <div className={`absolute inset-[85px] rounded-full bg-white blur-[6px] shadow-[0_0_40px_15px_rgba(52,143,192,0.8)] ${isListening ? 'opacity-90 animate-pulse' : 'opacity-40 shadow-none'}`} />
            </div>

            {/* Bottom UI Controls */}
            <div className="absolute bottom-8 inset-x-0 w-full flex flex-col items-center justify-end z-20">
                <div className="h-6 mb-6 flex items-center justify-center">
                    {!showTranscript && (
                        <p className={`text-md tracking-tight transition-colors duration-300 ${isListening ? 'text-white/70' : 'text-white/40'}`}>
                            {isListening ? 'Listening...' : 'Paused'}
                        </p>
                    )}
                </div>

                {showTranscript ? (
                    <div className="w-[90%] md:w-[70%] max-w-2xl flex items-center gap-3 border border-white/10 p-2 rounded-full bg-black/60 backdrop-blur-xl shadow-lg mb-2">
                        <button
                            onClick={() => setShowTranscript(false)}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/70 hover:text-white shrink-0 group"
                            title="Switch to Voice Mode"
                        >
                            <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Message Second Brain..."
                            className="flex-1 bg-transparent text-white placeholder:text-white/40 border-none outline-none text-sm px-2"
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="w-10 h-10 rounded-full bg-[#348fc0] hover:bg-[#348fc0]/80 shadow-[0_0_15px_rgba(52,143,192,0.4)] flex items-center justify-center text-white shrink-0 transition-all group"
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-6 border border-white/5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xl">
                        <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all group ${showTranscript ? 'bg-white/15 border-white/20 shadow-md' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
                        >
                            {showTranscript ? (
                                <MessageSquare className="w-5 h-5 text-white transition-colors" />
                            ) : (
                                <Bot className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsListening(!isListening)}
                            className={`relative w-16 h-16 rounded-full border flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition-all group overflow-hidden ${isListening ? 'bg-[#348fc0]/10 border-[#348fc0]/40 shadow-[0_0_20px_rgba(52,143,192,0.2)]' : 'bg-white/5 border-white/10 shadow-none'}`}
                        >
                            <div className={`absolute inset-0 bg-linear-to-b transition-[opacity,transform] duration-300 ${isListening ? 'from-[#348fc0]/30 to-transparent opacity-0 group-hover:opacity-100' : 'from-white/10 to-transparent opacity-0 group-hover:opacity-100'}`} />
                            <div className={`absolute inset-0 rounded-full border transition-colors ${isListening ? 'border-white/20 group-hover:border-white/50' : 'border-white/10 group-hover:border-white/30'}`} />
                            {isListening ? (
                                <Mic className="w-6 h-6 text-[#348fc0] drop-shadow-[0_0_8px_rgba(52,143,192,0.8)] relative z-10 group-hover:text-white group-hover:drop-shadow-none transition-colors" />
                            ) : (
                                <MicOff className="w-6 h-6 text-white/50 relative z-10 group-hover:text-white transition-colors" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsEnded(true)}
                            className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 backdrop-blur-md flex items-center justify-center transition-all group"
                        >
                            <X className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                        </button>
                    </div>
                )}
            </div>

            {/* Session Ended Overlay */}
            {isEnded && (
                <div className="absolute inset-0 bg-[#030508]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <Bot className="w-8 h-8 text-white/40" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Session Ended</h3>
                    <p className="text-white/50 text-sm mb-8 px-4">Your conversation has been saved to your workspace transcripts.</p>

                    <button
                        onClick={() => { setIsEnded(false); setIsListening(true); setShowTranscript(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 transition-all"
                    >
                        <RefreshCcw className="w-4 h-4" /> Start New Session
                    </button>
                </div>
            )}
        </div>
    );
}

export default AskChat;