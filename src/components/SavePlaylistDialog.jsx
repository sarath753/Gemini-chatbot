import { supabase } from '../Services/supabase';

function SavePlaylistDialog({
  showSaveDialog,
  setShowSaveDialog,
  playlistName,
  setPlaylistName,
  playlist,
  messages,
  savedPlaylists,
  setSavedPlaylists,
  setMessages,
  setPlaylist,
  user,
  selectedPlaylist
}) {
  const handleSavePlaylist = async () => {
    if (playlist.length === 0) return;
    if (!user) {
      console.error('No user, cannot save playlist');
      return;
    }

    try {
      // If we already have a selectedPlaylist, just update its title
      if (selectedPlaylist) {
        const { error } = await supabase
          .from('playlists')
          .update({ title: playlistName || 'Untitled Playlist' })
          .eq('id', selectedPlaylist.id);
        
        if (error) {
          console.error('Error updating playlist title:', error);
          return;
        }
        
        // Update local state
        setSavedPlaylists(prev => 
          prev.map(pl => 
            pl.id === selectedPlaylist.id 
              ? { ...pl, title: playlistName || 'Untitled Playlist' } 
              : pl
          )
        );
        
        setShowSaveDialog(false);
        return;
      }
      
      // Otherwise, create a new playlist
      const newPlaylist = {
        title: playlistName || 'Untitled Playlist',
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      // Create the playlist
      const { data, error } = await supabase
        .from('playlists')
        .insert([newPlaylist])
        .select();
  
      if (error) {
        console.error('Error inserting playlist:', error);
        return;
      }
  
      const insertedPlaylist = data[0];

      // Insert the songs
      if (playlist?.length) {
        const songsToInsert = playlist.map(song => ({
          playlist_id: insertedPlaylist.id,
          title: song.title,
          artist: song.artist,
          created_at: new Date().toISOString()
        }));

        const { error: songsError } = await supabase
          .from('songs')
          .insert(songsToInsert);

        if (songsError) {
          console.error('Error inserting songs:', songsError);
        }
      }

      // Insert the conversation messages
      if (messages?.length) {
        const messagesToInsert = messages.map(message => ({
          playlist_id: insertedPlaylist.id,
          content: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
          sender: message.sender,
          is_playlist: message.isPlaylist,
          created_at: new Date().toISOString()
        }));

        const { error: messagesError } = await supabase
          .from('messages')
          .insert(messagesToInsert);

        if (messagesError) {
          console.error('Error inserting messages:', messagesError);
        }
      }

      // Update local state
      setSavedPlaylists((prev) => [insertedPlaylist, ...prev]);

      setShowSaveDialog(false);
      setPlaylistName('');
      setMessages([
        { 
          text: "Hi! I'm your playlist assistant. Tell me what kind of music you like...",
          sender: 'bot',
          isPlaylist: false
        }
      ]);
      setPlaylist([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showSaveDialog ? '' : 'hidden'}`}>
      <div className="bg-gray-900 rounded-lg p-6 w-96 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-purple-300">
          {selectedPlaylist ? 'Update Playlist Name' : 'Save Playlist'}
        </h3>
        <input
          type="text"
          placeholder="Enter playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          maxLength={50}
          className="w-full p-2 border border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-800 text-gray-300"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowSaveDialog(false)}
            className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePlaylist}
            disabled={!playlistName.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {selectedPlaylist ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavePlaylistDialog;