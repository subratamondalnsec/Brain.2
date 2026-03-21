import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const ImageModel = ({ fullScreenImage, setFullScreenImage }) => {
  return (
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
  );
};
