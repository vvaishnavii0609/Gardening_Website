import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import YardIcon from '@mui/icons-material/Yard';

const Root = styled('div')(({ theme }) => ({
  flexGrow: 1,
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 4),
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const Title = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontWeight: 'bold',
  letterSpacing: '1px',
}));

const NavLinks = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Navbar = () => {
  return (
    <Root>
      <StyledAppBar position="static">
        <StyledToolbar>
          <Logo>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <LocalFloristIcon fontSize="large" />
            </IconButton>
            <Title variant="h5">
              Garden Of Eden
            </Title>
          </Logo>
          <NavLinks>
            <Link to={"/"} style={{ textDecoration: 'none' }}>
              <StyledButton startIcon={<HomeIcon />}>Home</StyledButton>
            </Link>
            <Link to={"/info"} style={{ textDecoration: 'none' }}>
              <StyledButton startIcon={<InfoIcon />}>Info</StyledButton>
            </Link>
            <Link to={"/chatbot"} style={{ textDecoration: 'none' }}>
            <StyledButton startIcon={<AssignmentIcon />}>Chatbot</StyledButton>
            </Link>
            <StyledButton startIcon={<YardIcon />}>Services</StyledButton>
          </NavLinks>
        </StyledToolbar>
      </StyledAppBar>
    </Root>
  );
};

export default Navbar;