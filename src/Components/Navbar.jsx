import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as ExploreIcon } from '../assets/svg/exploreIcon.svg';
import { ReactComponent as PersonOutlineIcon } from '../assets/svg/personOutlineIcon.svg';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if the current route matches the specified route
  const pathMatchRoute = (route) => {
    return route === location.pathname;
  };

  // Determine if the current page is the Profile page
  const isProfilePage = pathMatchRoute('/profile');

  // Define the styles for the navbar, changing the position based on the current page
  const navbarStyle = {
    position: isProfilePage ? 'sticky' : 'sticky',
    left: 0,
    bottom: 0,
    right: 0,
    height: '85px',
    backgroundColor: '#ffffff',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <footer className="navbar" style={navbarStyle}>
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={() => navigate('/')}>
            <ExploreIcon
              fill={pathMatchRoute('/') ? '#2c2c2c' : '#8f8f8f'}
              width={'36px'}
              height={'36px'}
            />
            <p
              className={
                pathMatchRoute('/')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }
            >
              Explore
            </p>
          </li>

          <li className="navbarListItem" onClick={() => navigate('/profile')}>
            <PersonOutlineIcon
              fill={pathMatchRoute('/profile') ? '#2c2c2c' : '#8f8f8f'}
              width={'36px'}
              height={'36px'}
            />
            <p
              className={
                pathMatchRoute('/profile')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }
            >
              Profile
            </p>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Navbar;
