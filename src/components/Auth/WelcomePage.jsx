import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <div className="max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="block"
            >
              Tired of struggling to find
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-400 to-pink-300 text-transparent bg-clip-text"
            >
              songs that match your mood?
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-lg md:text-xl text-gray-300 mb-8"
          >
            Welcome to the perfect place to find{' '}
            <span className="text-purple-400 font-semibold">YOUR</span> playlist.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 
                         hover:from-purple-700 hover:to-purple-900 text-white font-semibold 
                         rounded-lg shadow-lg hover:shadow-purple-500/30 transition duration-200
                         w-full sm:w-auto"
              >
                Get Started
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent border-2 border-purple-500/30 
                         text-white font-semibold rounded-lg hover:bg-purple-500/10 
                         transition duration-200 w-full sm:w-auto"
              >
                I already have an account
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="mt-12"
        >
          <div className="flex justify-center space-x-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 }}
              className="w-16 h-16 rounded-full relative overflow-hidden group"
            >
              <img 
                src="https://api.floodmagazine.com/wp-content/uploads/2021/08/Billie-Eilish-Happier-Than-Ever.jpeg" 
                alt="Billie Eilish"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors duration-200"></div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.9 }}
              className="w-16 h-16 rounded-full relative overflow-hidden group"
            >
              <img 
                src="https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022" 
                alt="Kendrick Lamar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors duration-200"></div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.0 }}
              className="w-16 h-16 rounded-full relative overflow-hidden group"
            >
              <img 
                src="https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9" 
                alt="Drake"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors duration-200"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;