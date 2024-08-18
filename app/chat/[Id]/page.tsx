'use client';

import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getDatabase, ref, onValue, off, push, serverTimestamp, get } from 'firebase/database';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import {
    Box,
    Typography,
    Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { useUser } from '@/contexts/UserContext';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
}

interface Participants {
    id: string;
    nickname: string;
    photoUrl: string
}

const ChatPage: React.FC = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const chatId = pathname ? pathname.split('/').pop() : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Participants | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(!user || !chatId) return;
    const db = getDatabase();
    const chatRef = ref(db, `chats/${chatId}`);

    const fetchUserData = async() => {
        const snapShot = await get(chatRef);
        const userData = snapShot.val();
        if(userData && userData.participants) {
            const otherUserData = Object.keys(userData.participants)
                                    .find(id => id !== user.uid)
            if(otherUserData) {
                const userRef = ref(db, `users/${otherUserData}`);
                const snapShot = await get(userRef);
                const participant =  snapShot.val();
                console.log(participant);
                setOtherUser({
                    id: otherUserData,
                    nickname: participant.nickname || '',
                    photoUrl: participant.photoUrl || ''
                })
            }
        }
    }
    fetchUserData();

    const messagesRef = ref(db, `chats/${chatId}/messages`);

    const fetchNewMessages = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setMessages(messageList);
      }
    };

    onValue(messagesRef, fetchNewMessages);

    return () => {
      off(chatRef, 'value', fetchNewMessages);
    };
  }, [chatId, user]);

  const keyDownHandler = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async() => {
    if(userMessage.trim() === '') return;
    if(!user) {
        console.error("User ID is undefined", user);
        return;
      }
      if(!chatId) {
        console.error("Chat ID is undefined");
        return;
    }
    const db = getDatabase();
    const chatRef = ref(db, `chats/${chatId}/messages`);
    try {
        await push(chatRef, {
            text: userMessage,
            senderId: user.uid,
            timestamp: serverTimestamp(),
        })
        setUserMessage('')
    } catch (error) {
        console.log("メッセージが送れませんでした。", error);
    }
  }

  if (!user) {
    return <Typography>ログインしてください。</Typography>;
  }
  if (!chatId) {
    return <Typography>チャットIDが見つかりません。</Typography>;
  }

  return (
    <div>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh' }}>
      {otherUser && (
        <Typography variant="h4" sx={{ p: 2 }}>{otherUser.nickname}</Typography>
      )}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column-reverse' }}>
        <div ref={messagesEndRef} />
        {messages.slice().reverse().map((message) => {
          const isCurrentUser = message.senderId === user.uid;
          return (
            <Box 
              key={message.id} 
              sx={{ 
                mb: 1, 
                display: 'flex', 
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start' 
              }}
            >
              {!isCurrentUser && otherUser && (
                <Avatar 
                  src={otherUser.photoUrl} 
                  alt={otherUser.nickname} 
                  sx={{ mr: 1, width: 32, height: 32 }} 
                />
              )}
              <Box
                sx={{
                  maxWidth: '70%',
                  backgroundColor: isCurrentUser ? '#DCF8C6' : '#E0E0E0',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  marginLeft: isCurrentUser ? 'auto' : '0',
                  marginRight: isCurrentUser ? '0' : 'auto'
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                  {new Date(message.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', p: 2, borderTop: '1px solid #e0e0e0' }}>
        <TextField
          sx={{ flexGrow: 1, mr: 1 }}
          placeholder="文字を入力"
          multiline
          rows={3}
          value={userMessage}
          variant="outlined"
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={keyDownHandler}
        />
        <Button 
          variant="contained" 
          onClick={sendMessage}
          disabled={userMessage.trim() === ''}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
    </div>
  );
};

export default ChatPage;