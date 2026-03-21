import React from 'react';
import { Menu, Zap, HelpCircle } from 'lucide-react';

function ChatHeader({ setSidebarOpen, mode, setMode }) {
  return (
    <header className="shrink-0 px-4 lg:px-8 min-h-[64px] flex items-center justify-between border-b border-white/5 relative z-30 bg-[#030508]/80 backdrop-blur-md">
      {/* Menu Icon */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-white/60 hover:text-white/80 transition-colors border border-white/10 rounded-full"
        >
          <Menu size={20} />
        </button>
        <span className="text-white/80 text-lg tracking-tight font-medium hidden sm:block">Brain.Storage</span>
      </div>
      {/* Send and Ask Buttons Container */}
      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
        <button 
            onClick={() => setMode('send')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${mode === 'send' ? 'bg-[#348fc0] text-white/70 shadow-[0_0_15px_rgba(52,143,192,0.4)]' : 'text-white/40 hover:text-white/70'}`}
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
    </header>
  );
}

export default ChatHeader;