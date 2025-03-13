import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call Supabase signUp function
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Check if the error is related to an existing account
        if (error.message.includes('already registered') || 
            error.message.includes('already in use') ||
            error.message.includes('already exists')) {
          setError(
            <div className="text-center">
              An account with this email already exists. 
              <Link to="/login" className="block mt-2 text-purple-400 hover:text-purple-300">
                Sign in instead
              </Link>
            </div>
          );
        } else {
          setError(error.message);
        }
      } else {
        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          // This means the user already exists but hasn't confirmed their email
          setError(
            <div className="text-center">
              An account with this email already exists.
              <Link to="/login" className="block mt-2 text-purple-400 hover:text-purple-300">
                Sign in to access the chat
              </Link>
            </div>
          );
        } else {
          // Redirect to a confirmation page
          navigate('/email-confirmation', { 
            state: { email: formData.email } 
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-purple-500/20">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-center text-white mb-2"
          >
            Create Account
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center text-purple-300/80 text-sm mb-8 italic"
          >
            One step closer to your mood-changing playlist
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-white mb-4"
              >
                {error}
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-purple-500/30 
                         text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 
                         focus:ring-2 focus:ring-purple-500/50 transition duration-200"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-purple-500/30 
                         text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 
                         focus:ring-2 focus:ring-purple-500/50 transition duration-200"
              />
            </motion.div>

            <motion.button
              type="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 
                       hover:from-purple-700 hover:to-purple-900 text-white font-semibold 
                       rounded-lg shadow-lg hover:shadow-purple-500/30 transition duration-200"
            >
              Sign Up
            </motion.button>
          </form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-gray-400"
          >
            Already have an account?{' '}
            <Link to='/login' className="text-purple-400 hover:text-purple-300 transition duration-200">Sign In</Link>

          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;