'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  InputAdornment,
} from '@mui/material';
import { Send, Person } from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';

interface Message {
  id: number;
  text: string;
  user: string;
  timestamp: Date;
}

export default function Chat() {
  const { messages, sendMessage, typing, setTyping, stopTyping } = useSocket();
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && username) {
      sendMessage(message, username);
      setMessage('');
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (username && e.target.value.trim()) {
      setTyping(username);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    } else {
      stopTyping();
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isUsernameSet) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#404040' }}>
          <Typography color="primary.main" variant="h4" component="h1" gutterBottom>
            Chat Next
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#FFFFFF' }}>
            Digite seu nome para entrar no chat
          </Typography>
          <TextField
            fullWidth
            label="Seu nome"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            sx={{
              mb: 2,
              '& .MuiInputBase-input': {
                color: '#FFFFFF',
              },
              '& .MuiInputLabel-root': {
                color: '#FFFFFF',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: '#FFFFFF' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleUsernameSubmit}
            disabled={!username.trim()}
            size="large"
            color='secondary'
            sx={{ color: '#FFFFFF' }}
          >
            Entrar no Chat
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Paper elevation={3} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', backgroundColor: '#404040' }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: '#FFFFFF', borderRadius: '8px 8px 0 0' }}>
          <Typography variant="h6" component="h1" sx={{ color: '#FFFFFF' }}>
            Chat Next
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
          <List>
            {messages.map((msg: Message) => (
              <ListItem key={msg.id} sx={{ py: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: msg.user === username ? 'primary.main' : 'secondary.main' }}>
                  {msg.user.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: '#FFFFFF' }}>
                        {msg.user}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFFFFF' }}>
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={<Typography sx={{ color: '#FFFFFF' }}>{msg.text}</Typography>}
                />
              </ListItem>
            ))}
            {typing && typing !== username && (
              <ListItem>
                <Avatar sx={{ mr: 2, bgcolor: 'grey.400' }}>
                  {typing.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={<Typography sx={{ color: '#FFFFFF' }}>{typing}</Typography>}
                  secondary={
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#FFFFFF',
                        border: '1px solid #FFFFFF',
                        borderRadius: '16px',
                        padding: '4px 8px',
                        display: 'inline-block',
                      }}
                    >
                      digitando...
                    </span>
                  }
                />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Divider />

        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{
              '& .MuiInputBase-input': {
                color: '#FFFFFF',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#FFFFFF',
                opacity: 0.7,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Send sx={{ color: '#FFFFFF' }} />
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
