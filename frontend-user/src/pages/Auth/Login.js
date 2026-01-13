import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setAnimateContent(true);

    const params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
      toast.error('Your session has expired. Please login again.', { id: 'session-expired' });
    }
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const data = await AuthService.login(username, password);
      toast.success('Login successful!');
      login(data);
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Something went wrong during login.';
      if (error && typeof error === 'object') {
        if (error.message) errorMsg = error.message;
        else if (typeof error === 'string') errorMsg = error;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      toast.error(errorMsg);
    }
  };

  return (
    <div className="position-relative overflow-hidden">
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.1) 0%, rgba(248, 250, 252, 0.8) 80%)',
        zIndex: 0,
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-120px',
        right: '-120px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(248, 250, 252, 0.8) 80%)',
        zIndex: 0,
        filter: 'blur(40px)',
        animation: 'float2 10s ease-in-out infinite'
      }} />

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(40px); }
            100% { transform: translateY(0); }
          }
          @keyframes float2 {
            0% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>

      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3 px-md-4">
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={10} md={6} lg={4}>
            <Card className="shadow-lg border-0" style={{
              backgroundColor: 'var(--card-color)',
              zIndex: 1,
              opacity: animateContent ? 1 : 0,
              transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out'
            }}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <i className="bi bi-person-circle display-4 text-primary mb-3"></i>
                  <h2 className="fw-bold text-primary">Login to JanDrishti JD</h2>
                  <p className="text-muted">Access your community dashboard</p>
                </div>

                <Form onSubmit={handleLogin} autoComplete="off">

                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={handleClickShowPassword}
                        aria-label="Toggle password visibility"
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold mb-3"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Button>

                  <div className="text-center">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--primary-color)' }}>
                      Register here
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
