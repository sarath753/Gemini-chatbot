import React from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../Services/supabase';

function Sidebar({
  user,
  playlists = [],
  setPlaylists,
  selectedPlaylist,
  setSelectedPlaylist
}) {
  const handleNewChat = async () => {
    if (!user) {
      console.error('No user logged in. Cannot create playlist.');
      return;
    }

    try {
      const newPlaylist = {
        title: 'New Playlist',
        user_id: user.id,
        created_at: new Date().toISOString()
      };
  
      const { data, error } = await supabase
        .from('playlists')
        .insert([newPlaylist])
        .select();
  
      if (error) {
        console.error('Error when creating the playlist:', error);
        return;
      }
  
      const insertedPlaylist = data[0];
      // Atualiza local
      setPlaylists((prev) => [insertedPlaylist, ...prev]);
      setSelectedPlaylist(insertedPlaylist);
    } catch (err) {
      console.error('Error when creating a new playlist:', err);
    }
  };

  return (
    <div 
      className="fixed top-[60px] left-0 w-80 h-[calc(100vh-60px)]
                 bg-gray-900/95 backdrop-blur-sm border-r border-purple-500/20"
    >
      <div className="p-4 border-b border-purple-500/20 bg-black/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 
                   hover:from-purple-700 hover:to-purple-900 text-white font-semibold 
                   rounded-lg shadow-lg hover:shadow-purple-500/30 transition duration-200
                   flex items-center justify-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 3a1 1 0 011 1v5h5a1 1 0 
                 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 
                 110-2h5V4a1 1 0 011-1z" 
              clipRule="evenodd" 
            />
          </svg>
          New Chat
        </motion.button>
      </div>

      <div className="overflow-y-auto h-[calc(100%-80px)]
                      scrollbar-thin scrollbar-thumb-purple-500/20 
                      scrollbar-track-transparent hover:scrollbar-thumb-purple-500/30">
        {playlists.length === 0 ? (
          <div className="p-4 text-center text-gray-400 italic">
            No chats yet. Start a new chat!
          </div>
        ) : (
          playlists.map((pl) => (
            <motion.div
              key={pl.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlaylist(pl)}
              className={`p-4 cursor-pointer transition-all duration-200 border-b border-purple-500/10
                        hover:bg-purple-500/10 ${
                          selectedPlaylist?.id === pl.id 
                            ? 'bg-purple-500/20 hover:bg-purple-500/20' 
                            : ''
                        }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 
                              flex items-center justify-center text-white shadow-lg">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10c0 3.866-3.582 7-8 7
                         a8.841 8.841 0 01-4.083-.98L2 17
                         l1.338-3.123C2.493 12.767 2
                         11.434 2 10c0-3.866 3.582-7
                         8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 
                         0h-2v2h2V9zM9 9h2v2H9V9z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {pl.title || 'New Playlist'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {new Date(pl.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
