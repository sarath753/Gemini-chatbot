import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js';
import { signOut } from '../../Services/authService';

const ManageProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Get the current user and their data
    const getUser = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', userError);
        }
        
        // Get user's playlist
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (playlistError) {
          console.error('Error fetching playlist:', playlistError);
        }
        
        setUser({
          ...session.user,
          ...userData
        });
        
        setPlaylist(playlistData || []);
      } catch (error) {
        console.error('Error in getUser:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-xl">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Account</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
          >
            Go to Chat
          </button>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex border-b border-purple-500/30 mb-8">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'playlist'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('playlist')}
          >
            My Playlist
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-purple-500/20"
          >
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-purple-400 mb-1">Email</h3>
                <p className="text-lg">{user?.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-purple-400 mb-1">User ID</h3>
                <p className="text-sm text-gray-400 break-all">{user?.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-purple-400 mb-1">Account Created</h3>
                <p className="text-lg">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString() 
                    : 'Not available'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Playlist Tab */}
        {activeTab === 'playlist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-purple-500/20"
          >
            <h2 className="text-2xl font-bold mb-6">My Playlists</h2>
            
            {playlist.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">You don&apos;t have any playlists yet.</p>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 
                           hover:from-purple-700 hover:to-purple-900 rounded-lg shadow-lg 
                           hover:shadow-purple-500/30 transition duration-200"
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {playlist.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition"
                  >
                    <h3 className="text-xl font-bold mb-2">{item.name || 'Untitled Playlist'}</h3>
                    <p className="text-gray-400 mb-4">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    
                    {item.songs && item.songs.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm text-purple-400 mb-2">Songs:</h4>
                        <ul className="space-y-2">
                          {item.songs.map((song, index) => (
                            <li key={index} className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                              <span className="text-purple-400">{index + 1}</span>
                              <div>
                                <p className="font-medium">{song.title}</p>
                                <p className="text-sm text-gray-400">{song.artist}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-400">No songs in this playlist</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ManageProfile;
