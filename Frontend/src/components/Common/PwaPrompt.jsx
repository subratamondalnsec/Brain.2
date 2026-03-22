import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PwaPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt natively
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the PWA install prompt');
        } else {
            console.log('User dismissed the PWA install prompt');
        }
        
        // Clear the saved prompt since it can't be used again
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#348fc0]/10 border border-[#348fc0]/30 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-6 z-50 animate-in zoom-in-95 fade-in duration-500 ease-out">
            <div className="flex flex-col items-center text-center">
                <span className="text-white text-lg font-semibold tracking-wide">Install Brain2</span>
                <span className="text-white/60 text-sm mt-1.5 max-w-[250px]">
                    Add this app to your home screen for a fast, native desktop experience.
                </span>
            </div>
            
            <div className="flex items-center gap-4 w-full justify-center">
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="h-10 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-white/50 hover:text-white text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleInstallClick}
                    className="h-10 px-6 rounded-xl bg-[#348fc0] hover:bg-[#348fc0]/80 text-white text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(52,143,192,0.4)] transition-colors"
                >
                    <Download className="w-4 h-4" /> Install App
                </button>
            </div>
        </div>
    );
};

export default PwaPrompt;
