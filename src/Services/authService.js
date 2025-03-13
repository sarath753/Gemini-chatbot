import { supabase } from './supabase.js';

// Session timeout in milliseconds (e.g., 7 days)
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if the user is authenticated and if their session is still valid
 * @returns {Promise<Object|null>} The user object if authenticated, null otherwise
 */
export const getCurrentUser = async () => {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }
    
    // Check if the session has expired based on our custom timeout
    const lastActivityTime = localStorage.getItem('lastActivityTime');
    
    if (lastActivityTime) {
      const currentTime = new Date().getTime();
      const timeSinceLastActivity = currentTime - parseInt(lastActivityTime, 10);
      
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session has expired, sign the user out
        await signOut();
        return null;
      }
    }
    
    // Update the last activity time
    updateLastActivityTime();
    
    return session.user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
};

/**
 * Update the last activity timestamp
 */
export const updateLastActivityTime = () => {
  localStorage.setItem('lastActivityTime', new Date().getTime().toString());
};

/**
 * Sign the user out and clear session data
 */
export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('lastActivityTime');
  } catch (error) {
    console.error('Error signing out:', error.message);
  }
};

/**
 * Set up activity tracking to update the last activity time
 */
export const setupActivityTracking = () => {
  // Update activity time on user interactions
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  events.forEach(event => {
    window.addEventListener(event, updateLastActivityTime, { passive: true });
  });
  
  // Initial activity time
  updateLastActivityTime();
}; 