import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Paper,
  Avatar,
  IconButton,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import DeleteIcon from '@mui/icons-material/Delete';
import { keyframes } from '@emotion/react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Chatbot = () => {
  const [messages, setMessages] = useState([{
    sender: 'bot',
    text: "Welcome to Garden Of Eden! I'm here to help with your gardening questions. 🌱"
  }]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    const newMessage = {
      sender: 'user',
      text: inputText,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    try {
      const response = await axios.post('http://localhost:3000/generate_response', {
        input_text: inputText
      });

      const botResponse = {
        sender: 'bot',
        text: typeof response.data.response === 'string' ? response.data.response : JSON.stringify(response.data.response),
      };

      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorResponse = {
        sender: 'bot',
        text: 'Sorry, I encountered an error while processing your request.',
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    }
  };

  const clearChat = () => {
    setMessages([{
      sender: 'bot',
      text: "Chat cleared! How can I help you with your garden? 🌱",
    }]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100%',
          minHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: 5,
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            right: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
          }}
        />
        <LocalFloristIcon
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            fontSize: 60,
            color: 'rgba(76, 175, 80, 0.2)',
            transform: 'rotate(-15deg)',
          }}
        />
        <LocalFloristIcon
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            fontSize: 60,
            color: 'rgba(33, 150, 243, 0.2)',
            transform: 'rotate(15deg)',
          }}
        />

        <Box
          sx={{
            width: '100%',
            maxWidth: '600px',
            mx: 'auto',
            mt: 4,
            p: 3,
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LocalFloristIcon /> Cherry Chatbot
            </Typography>
            <IconButton 
              onClick={clearChat}
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'error.light',
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              height: '60vh', 
              overflow: 'auto',
              p: 2,
              mb: 2,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(76, 175, 80, 0.5)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(76, 175, 80, 0.7)',
                },
              },
            }}
            ref={chatContainerRef}
          >
            <List>
              {messages.map((message, index) => (
                <ListItem 
                  key={index} 
                  sx={{
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    animation: `${fadeIn} 0.3s ease-out`,
                    py: 0.5,
                  }}
                >
                  <Box 
                    sx={{
                      display: 'flex',
                      flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      maxWidth: '80%',
                      gap: 1,
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                        width: 32,
                        height: 32,
                      }}
                    >
                      {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                    </Avatar>
                    <Paper 
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: message.sender === 'user' ? 'primary.light' : 'secondary.light',
                        maxWidth: '100%',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography 
                        component="div"
                        sx={{
                          color: message.sender === 'user' ? 'primary.contrastText' : 'secondary.contrastText',
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line',
                          '& strong': {
                            fontWeight: 600,
                          },
                          '& ul': {
                            margin: '8px 0',
                            paddingLeft: '20px',
                          },
                          '& li': {
                            margin: '4px 0',
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: message.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/•\s*/g, '• ')
                            .replace(/(\d+\.\s)/g, '<br>$1')
                            .replace(/\n/g, '<br>')
                        }}
                      />
                    </Paper>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>

          <Box 
            component="form" 
            onSubmit={handleSendMessage} 
            sx={{ 
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              fullWidth
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              sx={{ 
                px: 3,
                minWidth: 'auto',
                height: 56,
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
                },
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Chatbot;