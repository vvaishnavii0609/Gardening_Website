import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, Paper, Avatar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { keyframes } from '@emotion/react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#2196f3',
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
  const [messages, setMessages] = useState([{sender:'bot', text:"Welcome to Garden Of Eden..."}]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault(); 
    if (inputText.trim() === '') return;

    const newMessage = {
      sender: 'user',
      text: inputText,
    };

    const botResponse = {
      sender: 'bot',
      text: 'This is a predefined response from the bot.',
    };

    setMessages(prevMessages => [...prevMessages, newMessage, botResponse]);
    setInputText('');
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
          background: 'linear-gradient(45deg, #e8f5e9 0%, #c8e6c9 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom:5
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
          }}
        />
        <LocalFloristIcon
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            fontSize: 60,
            color: 'rgba(76, 175, 80, 0.2)',
          }}
        />
        <LocalFloristIcon
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            fontSize: 60,
            color: 'rgba(33, 150, 243, 0.2)',
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
          bgcolor: 'background.paper',
          boxShadow: 6,
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          Cherry Chatbot
        </Typography>
        <Paper 
          elevation={3} 
          sx={{ 
            height: '60vh', 
            overflow: 'auto', 
            p: 2, 
            mb: 2, 
            borderRadius: 2,
            '&::-webkit-scrollbar': {
              width: '0.4em'
            },
            '&::-webkit-scrollbar-track': {
              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
              webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.1)',
              outline: '1px solid slategrey'
            }
          }}
          ref={chatContainerRef}
        >
          <List>
            {messages.map((message, index) => (
              <ListItem 
                key={index} 
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: `${fadeIn} 0.5s ease-out`,
                }}
              >
                <Box 
                  sx={{
                    display: 'flex', 
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    maxWidth: '80%',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                      mr: message.sender === 'user' ? 0 : 1,
                      ml: message.sender === 'user' ? 1 : 0,
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  <Paper 
                    elevation={1}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'secondary.light',
                    }}
                  >
                    <Typography variant="body1" color={message.sender === 'user' ? 'primary.contrastText' : 'secondary.contrastText'}>
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex' }}>
          <TextField
            variant="outlined"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            fullWidth
            sx={{ mr: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            sx={{ px: 3, borderRadius: 2 }}
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