import { useState, useEffect } from 'react';
import { supabase } from '../Services/supabase';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import SavePlaylistDialog from './SavePlaylistDialog';

function HomePage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    { 
      text: "Hi! I'm your playlist assistant. Tell me what kind of music you like...",
      sender: 'bot',
      isPlaylist: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [playlist, setPlaylist] = useState([]); 
  const [playlists, setPlaylists] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Get user session
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };
    getSession();

    // Listen to auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch playlists when user changes
  useEffect(() => {
    if (!user) return;

    const fetchPlaylists = async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching playlists:', error);
      } else {
        setPlaylists(data || []);
      }
    };

    fetchPlaylists();
  }, [user]);

  // Reset message state when changing playlists
  useEffect(() => {
    if (selectedPlaylist) {
      // Message loading is now handled in ChatArea component
      setPlaylistName(selectedPlaylist.title || '');
    } else {
      setMessages([
        { 
          text: "Hi! I'm your playlist assistant. Tell me what kind of music you like...",
          sender: 'bot',
          isPlaylist: false
        }
      ]);
      setPlaylist([]);
      setPlaylistName('');
    }
  }, [selectedPlaylist]);

  return (
    <div className="bg-gray-900 h-screen w-screen overflow-hidden">
      {/* Fixed navbar at the top */}
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* Main content */}
      <div className="relative h-full">
        <Sidebar
          user={user}
          playlists={playlists}
          setPlaylists={setPlaylists}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
        />

        <ChatArea 
          user={user}
          messages={messages}
          setMessages={setMessages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          playlist={playlist}
          setPlaylist={setPlaylist}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setShowSaveDialog={setShowSaveDialog}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
          playlists={playlists}
          setPlaylists={setPlaylists}
        />
      </div>

      {/* Save playlist dialog */}
      <SavePlaylistDialog 
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        playlistName={playlistName}
        setPlaylistName={setPlaylistName}
        playlist={playlist}
        messages={messages}
        savedPlaylists={playlists}
        setSavedPlaylists={setPlaylists}
        setMessages={setMessages}
        setPlaylist={setPlaylist}
        user={user}
        selectedPlaylist={selectedPlaylist}
      />
    </div>
  );
}

export default HomePage;