import React, { useState } from 'react';
import { XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

const NotPermitted: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const iconAnimation = useSpring({
    transform: isHovered ? 'scale(1.1) rotate(360deg)' : 'scale(1) rotate(0deg)',
    config: { tension: 300, friction: 10 },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 px-4 overflow-hidden">
      <BackgroundAnimation />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full backdrop-blur-sm bg-opacity-80">
          <animated.div style={iconAnimation}>
            <XCircle 
              className="w-20 h-20 text-red-500 mx-auto mb-6" 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
          </animated.div>
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">Not Permitted</h1>
          <p className="text-lg text-gray-600 text-center mb-8">
            You do not have the required permissions to access this page.
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button 
              className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center"
              onClick={() => window.history.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="mr-2" size={18} />
              Go Back
            </motion.button>
            <motion.button 
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors duration-200 flex items-center"
              onClick={() => window.location.href = '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AlertTriangle className="mr-2" size={18} />
              Report Issue
            </motion.button>
          </div>
        </div>
      </motion.div>
      <ErrorMessages />
    </div>
  );
};

const BackgroundAnimation: React.FC = () => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-red-200 rounded-full opacity-20"
        style={{
          width: Math.random() * 100 + 50,
          height: Math.random() * 100 + 50,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    ))}
  </div>
);

const ErrorMessages: React.FC = () => {
  const messages = [
    "Access Denied", "Unauthorized", "Forbidden", "No Entry"
  ];

  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          className="text-red-400 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          {message}
        </motion.div>
      ))}
    </div>
  );
};

export default NotPermitted;
