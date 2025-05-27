import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
}

export const Transition: React.FC<TransitionProps> = ({ children, show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 