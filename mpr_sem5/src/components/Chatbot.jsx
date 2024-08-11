import React, { useState } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
  },
});

const Chatbot = () => {
  const [messages, setMessages] = useState([{sender:'bot',text:"Welcome to Garden Of Eden..."}]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      sender: 'user',
      text: inputText,
    };

    const botResponse = {
      sender: 'bot',
      text: 'This is a predefined response from the bot.',
    };

    setMessages([...messages, newMessage, botResponse]);
    setInputText('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '600px',
          mx: 'auto',
          mt:2,
          p: 2,
          border: 1,
          borderColor: 'grey.300',
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Chatbot
        </Typography>
        <Paper elevation={2} sx={{ minHeight: '60vh',maxHeight:'60vh', overflow: 'auto', p: 2, mb: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      color={message.sender === 'user' ? 'primary' : 'secondary'}
                      fontWeight="bold"
                    >
                      {message.sender === 'user' ? 'You' : 'Bot'}
                    </Typography>
                  }
                  secondary={message.text}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Box sx={{ display: 'flex' }}>
          <TextField
            variant="outlined"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            fullWidth
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Chatbot;
