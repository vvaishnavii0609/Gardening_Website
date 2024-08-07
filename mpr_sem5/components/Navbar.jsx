import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';

const Root = styled('div')(({ theme }) => ({
  flexGrow: 1,
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
}));

const NavLinks = styled('div')(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'flex-end',
}));

const Navbar = () => {

  return (
    <Root>
      <AppBar position="static" style={{backgroundColor:'green'}}>
        <Toolbar>
          <Title variant="h5">
            Gardening Website
          </Title>
          <NavLinks>
            <Button color="inherit">Home</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Services</Button>
            <Button color="inherit">Contact</Button>
          </NavLinks>
        </Toolbar>
      </AppBar>
    </Root>
  );
};

export default Navbar;
