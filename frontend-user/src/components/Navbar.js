import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const circleButtonStyle = {
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderWidth: '2px',
    padding: '0',
    lineHeight: '1',
    transition: 'all 0.2s ease'
  };


  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar
      bg={isDarkMode ? 'dark' : 'white'}
      variant={isDarkMode ? 'dark' : 'light'}
      expand="lg"
      sticky="top"
      className={`py-3 shadow-sm ${isDarkMode ? 'border-bottom border-secondary' : 'border-bottom'}`}
    >
      <Container className="px-3 px-md-4 px-lg-5">
        <Nav.Link as={Link} to="/home" className="d-flex align-items-center ps-0 navbar-brand">
          <Logo fontSize="1.4rem" />
        </Nav.Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-lg-auto text-center py-3 py-lg-0 fw-semibold">
            <Nav.Link
              as={Link}
              to="/home"
              className="px-lg-3 mx-lg-1"
              active={isActive('/home') || isActive('/')}
            >
              Home
            </Nav.Link>

            {user && (
              <>
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  className="px-lg-3 mx-lg-1"
                  active={isActive('/dashboard')}
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/report-issue"
                  className="px-lg-3 mx-lg-1"
                  active={isActive('/report-issue')}
                >
                  Report Issue
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="ms-auto align-items-center gap-2 gap-md-3 flex-wrap justify-content-center">

            <button
              className="action-btn"
              onClick={toggleTheme}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>

            {user ? (
              <>

                <Button
                  as={Link}
                  to="/profile"
                  variant={isDarkMode ? 'outline-light' : 'outline-primary'}
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    ...circleButtonStyle,
                    fontSize: '18px',
                    fontWeight: '700'
                  }}
                  title="View Profile"
                >
                  {(user.full_name || user.username || 'U')[0].toUpperCase()}
                </Button>

                <Button
                  variant="danger"
                  className="px-3 px-md-4 fw-bold rounded-pill shadow-sm d-flex align-items-center"
                  style={{ height: '46px', fontSize: '0.9rem' }}
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-1 me-md-2"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="fw-bold px-3 px-md-4 rounded-pill"
                  style={{ height: '46px', fontSize: '0.9rem' }}
                >
                  Login
                </Button>

                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  className="fw-bold px-3 px-md-4 rounded-pill shadow-sm"
                  style={{ height: '46px', fontSize: '0.9rem' }}
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
