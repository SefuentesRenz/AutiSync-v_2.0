<<<<<<< HEAD
import { createContext, useContext, useState } from "react";
=======
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { 
  getOrCreateRoomByNumber, 
  fetchMessages, 
  sendMessage, 
  subscribeToRoomMessages, 
  unsubscribeChannel 
} from '../lib/chatApi';
>>>>>>> f26317b7c99d2f3ed1f8da137d6f9f67a6ec5670

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [showChatBar, setShowChatBar] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
<<<<<<< HEAD
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim() !== '') {
      const newMessage = {
        id: Date.now(),
        text: messageInput,
        sender: 'you',
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessageInput('');
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          text: 'Hi there! 👋',
          sender: 'friend',
        };
        setChatMessages((prev) => [...prev, reply]);
      }, 1500);
    }
  };

  return (
    <ChatContext.Provider value={{
      showChatBar, setShowChatBar,
      roomNumber, setRoomNumber,
      chatMessages, setChatMessages,
      messageInput, setMessageInput,
      handleSendMessage
=======
  const [roomId, setRoomId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [subChannel, setSubChannel] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      console.log('🔍 Fetching current user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        return;
      }
      
      if (!user) {
        console.warn('⚠️ No authenticated user found');
        return;
      }
      
      console.log('✅ Auth user found:', user.email);
      
      // Get user_profiles id from auth user
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        return;
      }
      
      if (profile) {
        setCurrentUserId(profile.id);
        console.log('✅ Current user profile loaded:', profile.full_name || profile.username);
        console.log('   Profile ID:', profile.id);
      } else {
        console.error('❌ No user profile found for user_id:', user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Join a room by room number
  const joinRoom = async (roomNum) => {
    if (!roomNum || !roomNum.trim()) {
      return { error: { message: 'Please enter a valid room number' } };
    }

    console.log('🚪 Attempting to join room:', roomNum);
    console.log('   Current userId state:', currentUserId);

    // Re-fetch user ID if not already set (fixes timing issues)
    let userId = currentUserId;
    
    if (!userId) {
      console.log('⚠️ User ID not in state, fetching now...');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Authentication failed:', authError);
        return { error: { message: 'User not authenticated. Please log in again.' } };
      }
      
      console.log('✅ Auth user found:', user.email);
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        console.error('❌ User profile not found:', profileError);
        return { error: { message: 'User profile not found. Please contact support.' } };
      }
      
      userId = profile.id;
      setCurrentUserId(userId);
      console.log('✅ Fetched user profile ID:', userId);
    }
    
    if (!userId) {
      console.error('❌ Still no userId after fetch');
      return { error: { message: 'User not authenticated' } };
    }

    setIsJoining(true);
    
    try {
      console.log('🚀 Joining room:', roomNum, 'with userId:', userId);
      
      // Get or create room (use local userId variable, not state)
      const { room, error: roomError } = await getOrCreateRoomByNumber(roomNum.trim(), userId);
      
      if (roomError || !room) {
        console.error('Failed to join room:', roomError);
        setIsJoining(false);
        return { error: roomError || { message: 'Failed to create/find room' } };
      }

      console.log('Room joined successfully:', room);
      
      setRoomNumber(roomNum.trim());
      setRoomId(room.id);

      // Fetch message history
      const { data: messages, error: messagesError } = await fetchMessages(room.id);
      
      if (messagesError) {
        console.error('Failed to fetch messages:', messagesError);
      } else if (messages) {
        console.log('Loaded message history:', messages.length);
        setChatMessages(messages);
      }

      // Subscribe to new messages
      console.log('🔗 Setting up realtime subscription for room:', room.id);
      console.log('🔗 Current user ID:', userId);
      
      const channel = subscribeToRoomMessages(room.id, (newMessage) => {
        console.log('💬 ========== CALLBACK RECEIVED ==========');
        console.log('💬 New message arrived via callback!');
        console.log('   Message text:', newMessage.text);
        console.log('   From user ID:', newMessage.user_id);
        console.log('   From user name:', newMessage.user_profiles?.full_name || newMessage.user_profiles?.username);
        console.log('   Message ID:', newMessage.id);
        console.log('   My user ID:', userId);
        console.log('   Is this my message?', newMessage.user_id === userId);
        
        // Add message immediately for ALL users (including sender via realtime)
        setChatMessages((prev) => {
          console.log('   📊 Current messages in state:', prev.length);
          console.log('   📊 Checking for duplicates...');
          
          // Check if message already exists (avoid duplicates)
          const exists = prev.some(m => {
            const isDuplicate = m.id === newMessage.id;
            if (isDuplicate) {
              console.log('   🔍 Found duplicate with ID:', m.id);
            }
            return isDuplicate;
          });
          
          if (exists) {
            console.log('   ⚠️ Message already exists in state, skipping');
            console.log('💬 ========== CALLBACK COMPLETE (SKIPPED) ==========');
            return prev;
          }
          
          console.log('   ✅ No duplicate found, adding message to state NOW!');
          const updated = [...prev, newMessage];
          console.log('   📊 New messages count:', updated.length);
          console.log('💬 ========== CALLBACK COMPLETE (ADDED) ==========');
          return updated;
        });
      });
      
      setSubChannel(channel);
      
      // TEMPORARY: Add polling as fallback to test if Realtime is the issue
      console.log('🔄 Setting up polling fallback (every 3 seconds)...');
      const pollInterval = setInterval(async () => {
        console.log('🔄 Polling for new messages...');
        const { data: latestMessages } = await fetchMessages(room.id, 50);
        if (latestMessages && latestMessages.length > 0) {
          setChatMessages((prev) => {
            // Only add messages that don't exist
            const newMsgs = latestMessages.filter(
              newMsg => !prev.some(existing => existing.id === newMsg.id)
            );
            if (newMsgs.length > 0) {
              console.log('🔄 Found', newMsgs.length, 'new messages via polling');
              return [...prev, ...newMsgs];
            }
            return prev;
          });
        }
      }, 3000);
      
      // Store interval ID to clear later
      window.__chatPollInterval = pollInterval;
      
      setShowChatBar(true);
      setIsJoining(false);
      
      return { room, error: null };
    } catch (e) {
      console.error('Unexpected error joining room:', e);
      setIsJoining(false);
      return { error: { message: e.message || 'Failed to join room' } };
    }
  };

  // Leave room and cleanup
  const leaveRoom = async () => {
    console.log('🚪 Leaving room and cleaning up...');
    
    // Clear polling interval
    if (window.__chatPollInterval) {
      console.log('🔄 Clearing polling interval');
      clearInterval(window.__chatPollInterval);
      window.__chatPollInterval = null;
    }
    
    // Delete all messages in this room before leaving
    if (roomId) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('room_id', roomId);
        
        if (error) {
          console.error('Error deleting messages:', error);
        } else {
          console.log('✅ All messages deleted from room');
        }
      } catch (e) {
        console.error('Unexpected error deleting messages:', e);
      }
    }
    
    // Unsubscribe from realtime
    if (subChannel) {
      await unsubscribeChannel(subChannel);
      setSubChannel(null);
    }
    
    // Clear local state
    setRoomId(null);
    setRoomNumber('');
    setChatMessages([]);
    setShowChatBar(false);
  };

  // Send a message
  const handleSendMessage = async () => {
    const userId = currentUserId; // Capture current value
    
    console.log('📤 Attempting to send message...');
    console.log('   Input:', messageInput);
    console.log('   Room ID:', roomId);
    console.log('   User ID:', userId);
    
    if (!messageInput.trim() || !roomId || !userId) {
      console.warn('❌ Cannot send message:', { 
        hasInput: !!messageInput.trim(), 
        hasRoom: !!roomId, 
        hasUser: !!userId 
      });
      return;
    }

    const messageText = messageInput.trim();
    setMessageInput(''); // Clear input immediately for better UX

    try {
      console.log('📨 Sending to Supabase:', messageText);
      
      const { data, error } = await sendMessage(roomId, userId, messageText);
      
      if (error) {
        console.error('❌ Failed to send message:', error);
        // Restore input on error
        setMessageInput(messageText);
        return;
      }

      console.log('✅ Message sent to database!');
      console.log('   Message ID:', data?.id);
      console.log('   Message data:', data);
      console.log('   📡 Realtime should broadcast this to ALL users (including me)');
      console.log('   ⏳ Waiting for Realtime callback...');
      
      // DON'T add optimistically - let Realtime handle it
      // This ensures consistent behavior for both directions
      // The message will appear when the Realtime event fires (usually < 500ms)
    } catch (e) {
      console.error('❌ Unexpected error sending message:', e);
      setMessageInput(messageText); // Restore input on error
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subChannel) {
        console.log('Cleaning up subscription on unmount');
        unsubscribeChannel(subChannel);
      }
    };
  }, [subChannel]);

  return (
    <ChatContext.Provider value={{
      showChatBar,
      setShowChatBar,
      roomNumber,
      setRoomNumber,
      chatMessages,
      setChatMessages,
      messageInput,
      setMessageInput,
      handleSendMessage,
      joinRoom,
      leaveRoom,
      isJoining,
      currentUserId
>>>>>>> f26317b7c99d2f3ed1f8da137d6f9f67a6ec5670
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}