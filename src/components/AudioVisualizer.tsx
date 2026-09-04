import React from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording }) => {
  if (!isRecording) return null;

  const barCount = 18;

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 border border-red-500/30 rounded-2xl backdrop-blur-md animate-pulse-slow">
      <div className="flex items-center gap-2 mr-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-xs font-semibold text-red-300 tracking-wide uppercase">Ovoz yozilmoqda...</span>
      </div>

      <div className="flex items-center gap-1 h-6">
        {Array.from({ length: barCount }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-red-500 via-pink-400 to-cyan-300"
            animate={{
              height: [
                `${Math.max(4, Math.random() * 24)}px`,
                `${Math.max(4, Math.random() * 24)}px`,
                `${Math.max(4, Math.random() * 24)}px`,
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.4 + (i % 5) * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};
