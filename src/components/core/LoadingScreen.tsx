'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Sparkles, Loader, CheckCircle } from 'lucide-react';

interface LoadingScreenProps {
  step: string;
  progress?: number; // Optional progress percentage (0-100)
}

// More sophisticated text animations
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.5 
    } 
  }
};

// Enhanced item animations with better physics
const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.2, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 10,
      delay: i * 0.2,
    },
  }),
  hover: {
    scale: 1.1,
    y: -5,
    rotate: 5,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    x: 50, 
    transition: { 
      duration: 0.4,
      ease: "backIn" 
    } 
  },
};

// Conveyor belt animation - adjusted to match the direction of icons entering from right
const beltVariants: Variants = {
  move: {
    x: ['0%', '-50%'],
    transition: {
      x: { 
        repeat: Infinity, 
        repeatType: 'loop', 
        duration: 15, // Slower to make the movement smoother
        ease: 'linear' 
      },
    },
  },
};

// Sparkle animation
const sparkleVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      delay: i * 0.4,
      ease: "easeInOut",
    },
  }),
};

// Progress bar animation
const progressVariants: Variants = {
  initial: { width: "0%" },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.8, ease: "easeOut" }
  })
};

export default function PremiumLoadingScreen({ step, progress }: LoadingScreenProps) {
  const steps = ['Gathering Ideas…', 'Writing Posts…', 'Adding Visuals…', 'Finalizing…'];
  const currentStepIndex = steps.indexOf(step);
  const [showSparkles, setShowSparkles] = useState(false);
  
  // Calculate progress based on step if not explicitly provided
  const calculatedProgress = progress || ((currentStepIndex + 1) / steps.length) * 100;
  
  // Show sparkles animation when step changes
  useEffect(() => {
    setShowSparkles(true);
    const timer = setTimeout(() => setShowSparkles(false), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  // Emoji mapping to step icons with more premium style
  const stepIcons = [
    { emoji: "💡", icon: <Sparkles size={28} className="text-yellow-300" /> },
    { emoji: "✒️", icon: <motion.div className="text-3xl">✒️</motion.div> },
    { emoji: "📸", icon: <motion.div className="text-3xl">📸</motion.div> },
    { emoji: "📬", icon: <CheckCircle size={28} className="text-green-400" /> },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-8 rounded-xl overflow-hidden shadow-2xl">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        
        {/* Sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={sparkleVariants}
            initial="hidden"
            animate="visible"
            custom={i}
          />
        ))}
      </div>

      {/* Premium Title */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-white text-2xl font-bold tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            Creating Your Content
          </span>
        </h1>
      </motion.div>

      {/* Current Step Indicator with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="relative z-10 flex items-center justify-center mb-6"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ 
                  rotate: [0, 360],
                  transition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              >
                <Loader size={18} className="text-blue-300" />
              </motion.div>
              <h2 className="text-white text-lg font-medium">
                {step}
              </h2>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
            variants={progressVariants}
            initial="initial"
            animate="animate"
            custom={calculatedProgress}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/60">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${i <= currentStepIndex ? 'bg-blue-400' : 'bg-white/20'}`}
              animate={i <= currentStepIndex ? { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] } : {}}
              transition={i <= currentStepIndex ? { 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse" 
              } : {}}
            />
          ))}
        </div>
      </div>

      {/* Premium Conveyor Belt */}
      <div className="relative w-full max-w-md">
        {/* Conveyor Belt Container */}
        <motion.div
          className="relative w-full h-32 bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-xl shadow-lg backdrop-blur-sm p-1 border border-white/10 overflow-hidden"
          animate={{
            boxShadow: [
              "0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 rgba(78, 109, 255, 0)",
              "0 8px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(78, 109, 255, 0.4)",
              "0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 rgba(78, 109, 255, 0)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Belt Surface */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <motion.div
              className="absolute top-0 left-0 w-[200%] h-full flex items-center"
              variants={beltVariants}
              animate="move"
              style={{
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 5%, rgba(0,0,0,0) 95%, rgba(0,0,0,0.3) 100%), linear-gradient(to right, rgba(255,255,255,0.1) 2px, transparent 2px)',
                backgroundSize: '100% 100%, 20px 100%',
              }}
            >
              {/* Items on Belt - positioned to start from right edge */}
              <div className="flex items-center gap-32 absolute" style={{ right: "-160px" }}> 
                {stepIcons.map((item, i) => (
                  currentStepIndex >= i && (
                    <motion.div
                      key={i}
                      className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700/80 to-gray-900/80 rounded-full backdrop-blur-sm border border-white/10 shadow-lg"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={i}
                    >
                      {/* Icon */}
                      {item.icon}
                      
                      {/* Glow Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            "0 0 0px rgba(255, 255, 255, 0.3)",
                            "0 0 8px rgba(255, 255, 255, 0.8)",
                            "0 0 0px rgba(255, 255, 255, 0.3)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    </motion.div>
                  )
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Overlay Sparkles on Step Completion */}
          <AnimatePresence>
            {showSparkles && (
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, -20 - Math.random() * 30],
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      delay: Math.random() * 0.5,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Reflection Effect */}
        <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-white/5 to-transparent -mt-1 rounded-b-xl transform scale-y-50 opacity-40" />
      </div>
      
      {/* Step Counter */}
      <motion.div 
        className="mt-6 text-white/80 text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Step {currentStepIndex + 1} of {steps.length}
      </motion.div>

      {/* Accessibility Fallback */}
      <div className="sr-only" aria-live="polite">
        Loading: {step}, Step {currentStepIndex + 1} of {steps.length}
      </div>
    </div>
  );
}