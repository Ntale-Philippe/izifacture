"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={clsx(
                "bg-card w-full max-w-lg rounded-2xl shadow-warm-lg pointer-events-auto overflow-hidden flex flex-col max-h-full",
                className
              )}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-line shrink-0">
                  <h2 className="font-display font-bold text-lg">{title}</h2>
                  <button onClick={onClose} className="p-1 text-muted hover:text-ink transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className="p-4 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
