import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function CameraCapture({ showCamera, closeCamera, videoRef, canvasRef, capturePhoto }) {
  return (
    <AnimatePresence>
      {showCamera && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
        >
           <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-4 right-4 z-70">
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
  );
}

export default CameraCapture;