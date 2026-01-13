import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const userTypes = [
  'Citizen', 'Student', 'Senior Citizen', 'Working Professional / Employee',
  'Business Owner', 'Homemaker', 'Unemployed', 'Retired', 'Other'
];

const Register = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('');
  const [userTypeCustom, setUserTypeCustom] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country] = useState('India');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (userType === 'Other' && !userTypeCustom) {
      toast.error('Please specify your user type.');
      return;
    }

    const fullAddress = `${house}, ${street}, ${city}, ${state} - ${pincode}, ${country}`;

    const registrationData = {
      username,
      password,
      fullName,
      phoneNumber,
      address: fullAddress,
      userType,
      userTypeCustom: userType === 'Other' ? userTypeCustom : null,
      email
    };

    try {
      setLoading(true);
      const data = await AuthService.register(registrationData);
      toast.success('Registration successful!');

      login(data);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-relative overflow-hidden bg-light min-vh-100 py-5">

      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(30, 58, 138, 0.05)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(249, 115, 22, 0.05)', filter: 'blur(100px)', zIndex: 0 }} />

      <Container className="position-relative px-3 px-md-4" style={{ zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <Row className="g-0">
                <Col md={12} className="p-3 p-md-4 p-lg-5">
                  <div className="text-center mb-4 mb-md-5">
                    <h1 className="display-6 display-md-5 fw-bold text-primary mb-2">Join Jan Drishti</h1>
                    <p className="text-muted fs-6 fs-md-5">Empower your community in one simple step</p>
                  </div>

                  <Form onSubmit={handleRegister}>
                    <div className="mb-5">
                      <h4 className="border-start border-4 border-primary ps-3 mb-4 fw-bold">
                        <i className="bi bi-shield-lock me-2"></i>Account Information
                      </h4>
                      <Row>
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Choose a unique username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                              className="py-2"
                            />
                            <Form.Text className="text-muted">This will be your identity for reporting issues.</Form.Text>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Password</Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="py-2"
                              />
                              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="py-2"
                              />
                              <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <div className="mb-5">
                      <h4 className="border-start border-4 border-primary ps-3 mb-4 fw-bold">
                        <i className="bi bi-person me-2"></i>Personal Details
                      </h4>
                      <Row>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter your full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">User Type</Form.Label>
                            <Form.Select
                              value={userType}
                              onChange={(e) => setUserType(e.target.value)}
                              required
                              className="py-2"
                            >
                              <option value="">Select your profile type</option>
                              {userTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        {userType === 'Other' && (
                          <Col md={12} className="mb-3">
                            <Form.Group>
                              <Form.Label className="fw-semibold">Specify User Type</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Please specify..."
                                value={userTypeCustom}
                                onChange={(e) => setUserTypeCustom(e.target.value)}
                                required
                                className="py-2"
                              />
                            </Form.Group>
                          </Col>
                        )}
                      </Row>
                    </div>

                    <div className="mb-5">
                      <h4 className="border-start border-4 border-primary ps-3 mb-4 fw-bold">
                        <i className="bi bi-telephone me-2"></i>Contact Details
                      </h4>
                      <Row>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              placeholder="Your 10-digit mobile number"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Email Address (Optional)</Form.Label>
                            <Form.Control
                              type="email"
                              placeholder="example@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                    <div className="mb-5">
                      <h4 className="border-start border-4 border-primary ps-3 mb-4 fw-bold">
                        <i className="bi bi-geo-alt me-2"></i>Address / Primary Area
                      </h4>
                      <Row>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">House / Building No.</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., #123, Rose Villa"
                              value={house}
                              onChange={(e) => setHouse(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Street / Area</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., MG Road, Koramangala"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">City</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., Bengaluru"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">State</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., Karnataka"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold">Pincode</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="6 digits"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              required
                              className="py-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">Country</Form.Label>
                            <Form.Control
                              type="text"
                              value={country}
                              readOnly
                              disabled
                              className="bg-light opacity-75"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <div className="d-grid mt-5">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="py-3 fw-bold rounded-pill shadow-sm transition-bounce"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-check-fill me-2"></i>
                            Complete Registration
                          </>
                        )}
                      </Button>
                      <div className="text-center mt-4">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="text-decoration-none fw-bold text-primary">
                          Login instead
                        </Link>
                      </div>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;