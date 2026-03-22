import React, { useState, useEffect } from 'react';
import { Download, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PwaPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Don't show if already installed as standalone
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        // Check if dismissed recently (24h cooldown)
        const dismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Delay show by 4s to not interrupt app loading
            setTimeout(() => setShowPrompt(true), 4000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Detect if user installs via browser's native button
        window.addEventListener('appinstalled', () => {
            setInstalled(true);
            setShowPrompt(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstalled(true);
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md"
                >
                    <div className="relative flex items-center gap-3 bg-[#030508]/95 backdrop-blur-2xl border border-[#348fc0]/30 rounded-2xl px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(52,143,192,0.1)] overflow-hidden">
                        
                        {/* Background ambient glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#348fc0]/5 via-transparent to-[#348fc0]/5 pointer-events-none" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#348fc0]/40 to-transparent" />

                        {/* Brain Icon */}
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#348fc0]/10 border border-[#348fc0]/20 flex items-center justify-center shadow-[0_0_12px_rgba(52,143,192,0.2)]">
                            <Brain className="w-5 h-5 text-[#348fc0]" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-[13px] font-semibold tracking-wide leading-tight">Install Brain.2</p>
                            <p className="text-white/40 text-[11px] mt-0.5 leading-tight truncate">Add to home screen for the full experience</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#348fc0] hover:bg-[#3facdf] text-white text-[12px] font-semibold transition-colors shadow-[0_0_12px_rgba(52,143,192,0.4)]"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                                title="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PwaPrompt;
