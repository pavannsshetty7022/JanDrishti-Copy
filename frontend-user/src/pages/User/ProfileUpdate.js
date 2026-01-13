import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import toast from 'react-hot-toast';


const userTypes = [
  'Student', 'Senior Citizen', 'Working Professional / Employee',
  'Business Owner', 'Homemaker', 'Unemployed', 'Retired', 'Other'
];

const ProfileUpdate = () => {
  const { user, updateProfileStatus, updateUserData, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [userType, setUserType] = useState('');
  const [userTypeCustom, setUserTypeCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateContent(true);

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await AuthService.getProfile(user.token);
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setAddress(data.address || '');
        setUserType(data.user_type || '');
        setUserTypeCustom(data.user_type_custom || '');
        setInitialLoad(false);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setInitialLoad(false);
        if (error.message === 'Failed to fetch profile' || error.message.includes('token')) {
          toast.error('Could not load existing profile. Please fill in details.');
        } else {
          toast.error(error.message || 'Error loading profile data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!user || !user.token) {
      toast.error('You must be logged in to update your profile.');
      setLoading(false);
      logout();
      return;
    }

    const profileData = {
      fullName,
      phoneNumber,
      address,
      userType: userType === 'Other' && !userTypeCustom ? '' : userType,
      userTypeCustom: userType === 'Other' ? userTypeCustom : null
    };

    if (!profileData.fullName || !profileData.phoneNumber || !profileData.address || !profileData.userType) {
      toast.error('All required fields must be filled.');
      setLoading(false);
      return;
    }
    if (profileData.userType === 'Other' && !profileData.userTypeCustom) {
      toast.error('Please specify your custom user type.');
      setLoading(false);
      return;
    }

    try {
      await AuthService.updateProfile(profileData, user.token);
      updateProfileStatus(true);
      updateUserData({ full_name: fullName });
      toast.success(user.profileCompleted ? 'Profile updated successfully!' : 'Profile completed successfully!');
      setTimeout(() => {
        navigate(user.profileCompleted ? '/profile' : '/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Something went wrong during profile update.');
    } finally {
      setLoading(false);
    }
  };



  if (loading && initialLoad) {
    return (
      <div className="d-flex flex-column">
        <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <h5 className="mt-3 text-primary">Loading profile...</h5>
          </div>
        </Container>
      </div>
    );
  }

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

      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5">
        <Row className="justify-content-center w-100">
          <Col xs={12} md={8} lg={6}>
            <BackButton />

            <Card className="shadow-lg border-0" style={{
              backgroundColor: 'var(--card-color)',
              zIndex: 1,
              opacity: animateContent ? 1 : 0,
              transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out'
            }}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <i className={`bi ${user.profileCompleted ? 'bi-person-check-fill' : 'bi-person-lines-fill'} display-4 text-primary mb-3`}></i>
                  <h2 className="fw-bold text-primary">
                    {user.profileCompleted ? 'Edit Your Profile' : 'Complete Your Profile'}
                  </h2>
                  <p className="text-muted">
                    {user.profileCompleted
                      ? 'Keep your contact information up to date'
                      : 'Please fill in your details to continue'}
                  </p>
                </div>

                <Form onSubmit={handleProfileUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={user?.username || ''}
                      readOnly
                      disabled
                      className="bg-light opacity-75 border-0"
                    />
                    <Form.Text className="text-muted small">Username cannot be changed.</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      id="phoneNumber"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      id="address"
                      placeholder="Enter your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>User Type</Form.Label>
                    <Form.Select
                      id="userType"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      required
                    >
                      <option value="">Select your user type</option>
                      {userTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {userType === 'Other' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Specify Other User Type</Form.Label>
                      <Form.Control
                        type="text"
                        id="userTypeCustom"
                        placeholder="Please specify your user type"
                        value={userTypeCustom}
                        onChange={(e) => setUserTypeCustom(e.target.value)}
                        required
                      />
                    </Form.Group>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {user.profileCompleted ? 'Saving Changes...' : 'Updating Profile...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${user.profileCompleted ? 'bi-save' : 'bi-check-circle'} me-2`}></i>
                        {user.profileCompleted ? 'Save Changes' : 'Update Profile'}
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileUpdate;