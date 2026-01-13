import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const AdminNavbar = () => {
  const { admin, logoutAdmin } = useAdminAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const circleButtonStyle = {
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderWidth: '2px',
    padding: '0',
    lineHeight: '1',
    transition: 'all 0.2s ease'
  };

  return (
    <Navbar
      bg={isDarkMode ? 'dark' : 'white'}
      variant={isDarkMode ? 'dark' : 'light'}
      expand="lg"
      sticky="top"
      className="shadow-sm py-3"
      style={{ borderBottom: isDarkMode ? '1px solid #333' : '1px solid #eee' }}
    >
      <Container className="px-3 px-md-4">

        <Nav.Link as={Link} to="/dashboard" className="navbar-brand d-flex align-items-center">
          <Logo fontSize="1.5rem" />
          <span className="ms-2 fw-bold text-primary h5 mb-0"></span>
        </Nav.Link>

        <div className="d-none d-lg-block position-absolute start-50 translate-middle-x">
          <span className="fw-bold text-muted text-uppercase small tracking-widest">
            Admin Management Portal
          </span>
        </div>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />

        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2 gap-md-3 flex-wrap justify-content-center">

            <Button
              variant={isDarkMode ? 'outline-light' : 'outline-dark'}
              onClick={toggleTheme}
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={circleButtonStyle}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'} fs-5`} />
            </Button>

            {admin && (
              <div className="d-flex align-items-center me-0 me-md-3 border-end pe-0 pe-md-3">
                <div className="text-end me-2 d-none d-md-block">
                  <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Logged in as</small>
                  <span className="fw-bold small text-primary">{admin.username || 'Admin'}</span>
                </div>
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '46px', height: '46px', fontSize: '1.2rem' }}>
                  <i className="bi bi-person-fill"></i>
                </div>
              </div>
            )}

            {admin ? (
              <Button
                variant="danger"
                className="px-3 px-md-4 fw-bold rounded-pill shadow-sm d-flex align-items-center"
                style={{ height: '46px', fontSize: '0.9rem' }}
                onClick={logoutAdmin}
              >
                <i className="bi bi-box-arrow-right me-1 me-md-2"></i>
                <span className="d-none d-sm-inline">Logout</span>
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" className="p-0">
                <Button variant="primary" size="sm" className="rounded-pill px-3">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </Button>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;