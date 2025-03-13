import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js';
import { updateLastActivityTime } from '../../Services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they were trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/chat';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('Invalid login credentials')) {
          setError(
            "Your email may not be confirmed. Would you like to " +
            "resend the confirmation email?"
          );
          setShowResendButton(true);
        } else {
          setError(error.message);
        }
      } else {
        console.log('user logged in:', data.user);
        // Update last activity time
        updateLastActivityTime();
        // Navigate to the page they were trying to access or default to chat
        navigate(from);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        navigate('/email-confirmation', { 
          state: { email: formData.email } 
        });
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
            Welcome Back
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-purple-300/80 text-sm mb-8 italic"
          >
            Your personalized playlist awaits you
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-purple-500/30 bg-gray-900/50 text-purple-600 focus:ring-purple-500/50"
                />
                <label htmlFor="remember" className="ml-2 text-gray-300">Remember me</label>
              </div>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition duration-200">
                Forgot password?
              </a>
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
              Sign In
            </motion.button>
          </form>

          {showResendButton && (
            <button
              onClick={handleResendConfirmation}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2"
              disabled={loading}
            >
              Resend Confirmation Email
            </button>
          )}

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-gray-400"
          >
            Don&apos;t have an account?{' '}
            <Link to='/signup' className="text-purple-400 hover:text-purple-300 transition duration-200">
              Sign Up
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;