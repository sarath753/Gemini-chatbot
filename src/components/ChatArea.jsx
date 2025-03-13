import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from 'framer-motion';
import { supabase } from '../Services/supabase';
import { useEffect } from 'react';

function ChatArea({
  user,
  messages,
  setMessages,
  inputMessage,
  setInputMessage,
  playlist,
  setPlaylist,
  isLoading,
  setIsLoading,
  setShowSaveDialog,
  selectedPlaylist,
  setSelectedPlaylist,
  playlists,
  setPlaylists
}) {
  // Store songs in DB
  const storeSongsInDB = async (songsArray, playlistId) => {
    if (!user) {
      console.error('No user logged in, cannot store songs');
      return;
    }

    const songsToInsert = songsArray.map(song => ({
      playlist_id: playlistId,
      title: song.title,
      artist: song.artist,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('songs')
      .insert(songsToInsert)
      .select();

    if (error) {
      console.error('Error inserting songs in DB:', error);
      return;
    }
    console.log('Songs inserted:', data);
  };

  // Store messages in DB
  const storeMessagesInDB = async (messagesArray, playlistId) => {
    if (!user) {
      console.error('No user logged in, cannot store messages');
      return;
    }

    // Create a new messages table if you don't have one yet
    const messagesToInsert = messagesArray.map(message => ({
      playlist_id: playlistId,
      content: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
      sender: message.sender,
      is_playlist: message.isPlaylist,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('messages') // You'll need to create this table
      .insert(messagesToInsert);

    if (error) {
      console.error('Error inserting messages in DB:', error);
      return;
    }
  };

  // Load messages for a playlist when selected
  useEffect(() => {
    if (selectedPlaylist && user) {
      loadPlaylistData(selectedPlaylist.id);
    }
  }, [selectedPlaylist, user]);

  const loadPlaylistData = async (playlistId) => {
    setIsLoading(true);
    
    try {
      // Fetch songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true });
        
      if (songsError) throw songsError;
      
      // Fecth messages (once you create the messages table)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      // Format songs for the playlist state
      if (songsData.length > 0) {
        const formattedSongs = songsData.map(song => ({
          title: song.title,
          artist: song.artist
        }));
        setPlaylist(formattedSongs);
      } else {
        setPlaylist([]);
      }
      
      // Forrmat messages for the messages state
      if (messagesData.length > 0) {
        const formattedMessages = messagesData.map(msg => ({
          text: msg.is_playlist ? JSON.parse(msg.content) : msg.content,
          sender: msg.sender,
          isPlaylist: msg.is_playlist
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([{ 
          text: "Hi! I'm your playlist assistant. Tell me what kind of music you like...",
          sender: 'bot',
          isPlaylist: false
        }]);
      }
    } catch (error) {
      console.error('Error loading playlist data:', error);
      setMessages([{ 
        text: "Hi! I'm your playlist assistant. Tell me what kind of music you like...",
        sender: 'bot',
        isPlaylist: false
      }]);
      setPlaylist([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPlaylist = async (userMessage) => {
    if (!user) {
      console.error('No user logged in, cannot create playlist');
      return null;
    }

    // Create a new playlist with the user's message as the title
    const newPlaylist = {
      title: userMessage.slice(0, 50), // Use first 50 chars of message as title
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([newPlaylist])
        .select();

      if (error) throw error;

      const insertedPlaylist = data[0];
      
      // Update local state
      setPlaylists(prev => [insertedPlaylist, ...prev]);
      setSelectedPlaylist(insertedPlaylist);
      
      return insertedPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  };

  // ********** WRITE the GENERATE PLAYLIST FUNCTION BELOW ************

  const generatePlaylist = async (userMessage) => {
    try {
      // ***** use the gemini api below*******
      
      
      // change the json file into 
      try {
        // Removes any JSON code block formatting from the bot's response.
        const cleanedResponse = botResponse.replace(/```json\n?|\n?```/g, '').trim();
        // Parses the cleaned response string into a JavaScript object or array.
        const playlistData = JSON.parse(cleanedResponse);
        // Checks if the parsed data is an array and has at least one item.
        if (Array.isArray(playlistData) && playlistData.length > 0) {
          // Updates the application's state with the new playlist data.
          setPlaylist(playlistData);
          // Returns an object indicating the data was successfully processed and is a playlist.
          return { text: playlistData, sender: 'bot', isPlaylist: true };
        }
      } catch (error) {
        // Logs any errors encountered during the parsing or processing to the console.
        console.error('Error parsing playlist:', error);
        
        // Returns an object indicating that there was an error processing the playlist data.
        return {
          text: 'Sorry, I had trouble formatting the playlist. Please try again.',
          sender: 'bot',
          isPlaylist: false
        };
      }
      return { text: botResponse, sender: 'bot', isPlaylist: false };
    } catch (error) {
      console.error('Gemini API Error:', error);
      let errorMessage = 'Sorry, I encountered an error.';
      if (error.message?.includes('API key')) {
        errorMessage = 'Check your API key.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error.';
      }
      return { text: errorMessage, sender: 'bot', isPlaylist: false };
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { 
      text: inputMessage, 
      sender: 'user', 
      isPlaylist: false 
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // First, create a new playlist in the database if we don't have one selected
      let currentPlaylist = selectedPlaylist;
      if (!currentPlaylist) {
        currentPlaylist = await createNewPlaylist(inputMessage);
      }

      if (!currentPlaylist) {
        throw new Error('Failed to create or select playlist');
      }

      // Generate the playlist data
      const botResponse = await generatePlaylist(inputMessage);
      const updatedMessages = [...messages, userMessage, botResponse];
      setMessages(updatedMessages);

      // If we got songs back, store them
      if (botResponse.isPlaylist && Array.isArray(botResponse.text) && botResponse.text.length > 0) {
        await storeSongsInDB(botResponse.text, currentPlaylist.id);
      }

      // Store the conversation messages
      await storeMessagesInDB(updatedMessages, currentPlaylist.id);

      // Update the playlist title if it's generic "New Playlist"
      if (currentPlaylist.title === 'New Playlist') {
        const { error } = await supabase
          .from('playlists')
          .update({ title: inputMessage.slice(0, 50) })
          .eq('id', currentPlaylist.id);

        if (error) {
          console.error('Error updating playlist title:', error);
        } else {
          // Update local state with the new title
          setPlaylists(prev => 
            prev.map(pl => 
              pl.id === currentPlaylist.id 
                ? { ...pl, title: inputMessage.slice(0, 50) } 
                : pl
            )
          );
          setSelectedPlaylist(prev => 
            prev?.id === currentPlaylist.id 
              ? { ...prev, title: inputMessage.slice(0, 50) } 
              : prev
          );
        }
      }
    } catch (error) {
      console.error('Message handling error:', error);
      setMessages(prev => [...prev, {
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        isPlaylist: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Functions to generate search URLs for services
  const getSpotifySearchUrl = (title, artist) => {
    const query = encodeURIComponent(`${title} ${artist}`);
    return `https://open.spotify.com/search/${query}`;
  };

  const getYoutubeSearchUrl = (title, artist) => {
    const query = encodeURIComponent(`${title} ${artist}`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  // Render message function - restored from original ChatArea.jsx with adjustments
  const renderMessage = (message) => {
    if (message.isPlaylist && Array.isArray(message.text)) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="font-medium text-purple-300 mb-2">Here's your playlist:</p>
          {message.text.map((song, songIndex) => (
            <motion.div 
              key={songIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: songIndex * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 shadow-md 
                       border border-purple-500/30 hover:border-purple-500/50 
                       transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 
                            rounded-full flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-200">{song.title}</div>
                <div className="text-sm text-gray-400">{song.artist}</div>
              </div>
              <div className="flex gap-2">
                <a
                  href={getSpotifySearchUrl(song.title, song.artist)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-green-400 hover:bg-green-500/10 rounded-full transition-all 
                           border border-green-500/30 hover:border-green-500/50"
                  title="Open in Spotify"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
                <a
                  href={getYoutubeSearchUrl(song.title, song.artist)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-all 
                           border border-red-500/30 hover:border-red-500/50"
                  title="Search on YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
          
          {/* Add the save playlist button */}
          <div className="mt-4">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                       hover:bg-purple-700 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:ring-opacity-50"
            >
              Save this playlist
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="whitespace-pre-wrap font-sans">
        {message.text}
      </div>
    );
  };

  return (
    <div 
      className="ml-80 pt-[60px] h-[calc(100vh-60px)] 
                 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900
                 flex flex-col"
    >
      {/* Messages container with scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 backdrop-blur-sm ${
                  message.sender === 'user'
                    ? 'bg-purple-600/80 text-white border border-purple-500/50'
                    : 'bg-gray-900/50 text-gray-200 border border-purple-500/30'
                }`}
              >
                {renderMessage(message)}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl px-4 py-3 border border-purple-500/30">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input bar in footer */}
      <div className="border-t border-purple-500/20 bg-gray-900/50 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe your mood or the type of playlist you want..."
              className="flex-1 p-3 border border-purple-500/30 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                         bg-gray-900/50 text-gray-200 placeholder-gray-400"
            />
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 
                         hover:from-purple-700 hover:to-purple-900 text-white font-semibold 
                         rounded-lg shadow-lg hover:shadow-purple-500/30 transition duration-200
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Send
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;