"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Search, Sparkles, Zap, CheckCircle2, Loader2 } from "lucide-react";

const steps = [
  { text: "Securely uploading document...", icon: FileText },
  { text: "Scanning layout and formatting...", icon: Search },
  { text: "AI analyzing keywords and skills...", icon: Sparkles },
  { text: "Generating tailored feedback...", icon: Zap },
  { text: "Finalizing your CV score...", icon: CheckCircle2 },
];

export function ScanningLoader({ fileName, onComplete }: { fileName: string; onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progression through steps
    const duration = 2500; // time per step
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        if (onComplete) {
          // Give it a small delay after the last step shows before completing
          setTimeout(onComplete, 1000);
        }
        return prev;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 w-full max-w-3xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 md:p-12 overflow-hidden relative"
      >
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-50" />
        <motion.div 
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <div className="text-center mb-10 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="w-24 h-24 rounded-full border-t-2 border-r-2 border-blue-500 absolute left-1/2 -top-4 -translate-x-1/2 opacity-20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
            className="w-24 h-24 rounded-full border-b-2 border-l-2 border-purple-500 absolute left-1/2 -top-4 -translate-x-1/2 opacity-20"
          />
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analyzing your CV</h2>
          <p className="text-gray-500 font-medium">Processing <span className="text-gray-900 font-semibold">{fileName}</span></p>
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-200" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-center gap-5 relative z-10 ${
                  isActive ? "opacity-100" : isCompleted ? "opacity-70" : "opacity-30"
                }`}
              >
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${
                    isCompleted 
                      ? "bg-green-50 border-green-200 text-green-600" 
                      : isActive 
                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                        : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </motion.div>
                
                <div className="flex-1">
                  <h4 className={`text-lg transition-colors duration-500 ${
                    isActive ? "text-gray-900 font-semibold" : "text-gray-600 font-medium"
                  }`}>
                    {step.text}
                  </h4>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-blue-600 mt-1">Please wait while our AI engine does its work...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-1"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}