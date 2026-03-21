import React from 'react';
import { Menu, Zap, HelpCircle } from 'lucide-react';

function ChatHeader({ setSidebarOpen, mode, setMode }) {
  return (
    <header className="shrink-0 px-4 lg:px-8 min-h-[64px] flex items-center justify-between fixed top-0 left-0 right-0 z-30 bg-linear-to-b from-[#030508]/80 from-30% to-transparent">
      {/* Menu Icon */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="ui-glow-btn active lg:hidden relative flex items-center justify-center cursor-pointer select-none rounded-full p-2 border transition-[box-shadow,border,background-color] duration-400 group"
        >
          <Menu size={18} className="relative z-10 transition-colors group-hover:text-white" />
        </button>
        <span className="text-white/80 text-lg tracking-tight font-medium hidden sm:block">Brain.Storage</span>
      </div>
      {/* Send and Ask Buttons Container */}
      <div className="flex items-center gap-2 bg-[rgba(35,60,87,0.6)] backdrop-blur-md p-1 py-1.5 rounded-full border border-[rgba(170,202,255,0.15)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] relative z-40">
        <button 
            onClick={() => setMode('send')}
            className={`ui-glow-btn relative flex items-center justify-center cursor-pointer select-none rounded-[22px] px-5 py-2 border transition-[box-shadow,border,background-color] duration-400 ${mode === 'send' ? 'active' : ''}`}
        >
            <Zap size={15} className="mr-2.5 h-[15px] w-[15px] relative z-10" />
            <span className="btn-txt text-[12px] font-bold tracking-[0.2em] uppercase text-white/40 transition-colors relative z-10">SEND</span>
        </button>
        <button 
            onClick={() => setMode('ask')}
            className={`ui-glow-btn relative flex items-center justify-center cursor-pointer select-none rounded-[22px] px-5 py-2 border transition-[box-shadow,border,background-color] duration-400 ${mode === 'ask' ? 'active' : ''}`}
        >
            <HelpCircle size={15} className="mr-2.5 h-[15px] w-[15px] relative z-10" />
            <span className="btn-txt text-[12px] font-bold tracking-[0.2em] uppercase text-white/40 transition-colors relative z-10">ASK</span>
        </button>
      </div>

    </header>
  );
}

export default ChatHeader;