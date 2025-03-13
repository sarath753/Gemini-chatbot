import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js'; // Fixed import path

const EmailConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resendStatus, setResendStatus] = useState('');
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    try {
      setResendStatus('sending');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setResendStatus(`Error: ${error.message}`);
      } else {
        setResendStatus('Confirmation email resent successfully!');
      }
    } catch (err) {
      setResendStatus(`Error: ${err.message}`);
    }
  };

  const goToLogin = () => {
    navigate('/login');
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
            Check Your Email
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-center"
          >
            <p className="mb-2 text-purple-300/80">
              We&apos;ve sent a confirmation email to:
            </p>
            <p className="font-semibold mb-4 text-white">{email}</p>
            <p className="mb-4 text-gray-300">
              Please check your inbox and click the confirmation link to activate your account.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <motion.button
              onClick={handleResendEmail}
              disabled={resendStatus === 'sending'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 
                       hover:from-purple-700 hover:to-purple-900 text-white font-semibold 
                       rounded-lg shadow-lg hover:shadow-purple-500/30 transition duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendStatus === 'sending' ? 'Sending...' : 'Resend Confirmation Email'}
            </motion.button>
            
            {resendStatus && resendStatus !== 'sending' && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center ${resendStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}
              >
                {resendStatus}
              </motion.p>
            )}

            <motion.button
              onClick={goToLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gray-800/50 text-gray-300 
                       hover:bg-gray-700/50 font-semibold rounded-lg 
                       border border-purple-500/20 transition duration-200 mt-2"
            >
              Back to Login
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailConfirmation; 