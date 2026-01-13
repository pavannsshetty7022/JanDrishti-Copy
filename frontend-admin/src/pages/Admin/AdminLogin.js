import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/Logo';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin } = useAdminAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    setMessage('');
    setLoading(false);
    setIsSuccessLoading(false);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('error');
    setLoading(true);

    try {
      const data = await AdminService.login(username, password);
      setLoading(false);
      setIsSuccessLoading(true);
      setTimeout(() => {
        loginAdmin(data);
      }, 1500);
    } catch (error) {
      console.error('Admin login error:', error);
      setMessage(error.message || 'Invalid credentials or server error.');
      setMessageType('error');
      setLoading(false);
    }
  };

  if (isSuccessLoading) {
    return (
      <div className="login-wrapper d-flex flex-column align-items-center justify-content-center">
        <div className="custom-spinner mb-4"></div>
        <h4 className="fw-bold">Initializing Session...</h4>
        <p className="text-muted">Redirecting to Admin Dashboard</p>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="position-absolute top-0 end-0 p-4">
        <button className="action-btn" onClick={toggleTheme}>
          <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
        </button>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={5} lg={4}>
            <div className="text-center mb-5" data-aos="fade-down">
              <Logo fontSize="3.5rem" className="mb-4 justify-content-center" />
              <p className="text-muted fw-bold text-uppercase small tracking-widest">Government Issue Management Portal</p>
            </div>

            <Card className="settings-card shadow-lg p-3" data-aos="zoom-in" data-aos-delay="100">
              <Card.Body>
                <Form onSubmit={handleLogin}>
                  {message && (
                    <Alert variant={messageType === 'error' ? 'danger' : 'success'} className="border-0 shadow-sm mb-4 small py-2">
                      {message}
                    </Alert>
                  )}

                  <div className="form-group mb-4">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter admin ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label mb-0">Password</label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none small text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-3 fw-bold mt-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      'Secure Sign In'
                    )}
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                      <i className="bi bi-shield-check me-1"></i>
                      OFFICIAL GOVERNMENT ACCESS ONLY
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>
        {`
          .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-color);
            position: relative;
            transition: var(--transition);
          }
          .custom-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--primary-light);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .scale-150 { transform: scale(1.5); }
          .tracking-widest { letter-spacing: 0.1em; }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;
