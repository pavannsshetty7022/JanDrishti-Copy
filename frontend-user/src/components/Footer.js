import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`py-5 mt-auto ${isDarkMode ? 'bg-dark text-light border-top border-secondary' : 'bg-light text-dark border-top'}`}>
      <Container className="px-3 px-md-4">
        <Row>
          <Col xs={12} md={6} lg={4} className="mb-4">
            <div className="mb-3">
              <Logo className="mb-3" />
            </div>
            <p className="mb-3 opacity-75" style={{ fontSize: '0.95rem' }}>
              JanDrishti JD is a community-driven platform that empowers citizens to report local issues and track their resolution, fostering transparent governance and community engagement.
            </p>
            <div className="d-flex gap-3">
              <a href="#!" className={`${isDarkMode ? 'text-light' : 'text-dark'} opacity-50 hover-opacity-100 transition-all`} aria-label="Facebook">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="#!" className={`${isDarkMode ? 'text-light' : 'text-dark'} opacity-50 hover-opacity-100 transition-all`} aria-label="Twitter">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="#!" className={`${isDarkMode ? 'text-light' : 'text-dark'} opacity-50 hover-opacity-100 transition-all`} aria-label="Instagram">
                <i className="bi bi-instagram fs-4"></i>
              </a>
              <a href="#!" className={`${isDarkMode ? 'text-light' : 'text-dark'} opacity-50 hover-opacity-100 transition-all`} aria-label="LinkedIn">
                <i className="bi bi-linkedin fs-4"></i>
              </a>
            </div>
          </Col>
          <Col xs={12} md={6} lg={4} className="mb-4">
            <h5 className="mb-3 fw-bold">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/home" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none opacity-75 hover-opacity-100`}>
                  <i className="bi bi-house-door me-2"></i>Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none opacity-75 hover-opacity-100`}>
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/report-issue" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none opacity-75 hover-opacity-100`}>
                  <i className="bi bi-plus-circle me-2"></i>Report Issue
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none opacity-75 hover-opacity-100`}>
                  <i className="bi bi-info-circle me-2"></i>About Us
                </Link>
              </li>
              <li className="mb-2">
                <a href="#!" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none opacity-75 hover-opacity-100`}>
                  <i className="bi bi-question-circle me-2"></i>Help & Support
                </a>
              </li>
            </ul>
          </Col>
          <Col xs={12} md={12} lg={4} className="mb-4">
            <h5 className="mb-3 fw-bold">Contact Information</h5>
            <div className="mb-2 opacity-75">
              <i className="bi bi-envelope me-2"></i>
              <a href="mailto:support@jandrishti.com" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none`} style={{ wordBreak: 'break-word' }}>
                support@jandrishti.com
              </a>
            </div>
            <div className="mb-2 opacity-75">
              <i className="bi bi-telephone me-2"></i>
              <a href="tel:+91-1234567890" className={`${isDarkMode ? 'text-light' : 'text-dark'} text-decoration-none`}>
                +91 9380335909
              </a>
            </div>
            <div className="mb-3 opacity-75">
              <i className="bi bi-geo-alt me-2"></i>
              <span className={isDarkMode ? 'text-light' : 'text-dark'}>Karnataka, India</span>
            </div>
            <div className="small opacity-50">
              <strong>Version:</strong> 1.0.0
            </div>
          </Col>
        </Row>
        <hr className={`my-4 ${isDarkMode ? 'border-secondary' : 'border-dark opacity-25'}`} />
        <Row>
          <Col className="text-center">
            <p className="mb-0 opacity-75">
              © {new Date().getFullYear()} JanDrishti JD. All rights reserved. | Powered by Community Spirit and Modern Technology.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
