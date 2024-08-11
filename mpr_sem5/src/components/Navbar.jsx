import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

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
          <Link to={"/"}><Button color="inherit">Home</Button></Link>
            <Link to={"/info"}><Button color="inherit">Info</Button></Link>
            <Button color="inherit">About</Button>
            <Button color="inherit">Services</Button>
          </NavLinks>
        </Toolbar>
      </AppBar>
    </Root>
  );
};

export default Navbar;
