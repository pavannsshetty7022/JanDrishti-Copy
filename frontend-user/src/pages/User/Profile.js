import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import AuthService from '../../services/auth.service';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, logout, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [animateContent, setAnimateContent] = useState(false);

    useEffect(() => {
        setAnimateContent(true);
        const fetchProfile = async () => {
            try {
                if (!user || !user.token) {
                    navigate('/login');
                    return;
                }
                const data = await AuthService.getProfile(user.token);
                setProfile(data);
                updateUserData({ full_name: data.full_name });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                toast.error('Failed to load profile details.');
                if (err.message.includes('token') || err.message.includes('Unauthorized')) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, navigate, logout, updateUserData]);



    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading profile...</p>
            </Container>
        );
    }

    return (
        <div className="position-relative overflow-hidden py-5">
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-50px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <Container>
                <BackButton />

                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Card
                            className="border-0 shadow-sm overflow-hidden"
                            style={{
                                backgroundColor: 'var(--card-color)',
                                opacity: animateContent ? 1 : 0,
                                transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.8s ease-out'
                            }}
                        >
                            <div className="p-4 p-md-5">
                                <div className="d-flex flex-column flex-md-row align-items-center mb-5">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-4 shadow-sm fw-bold shadow"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'white',
                                            fontSize: '3.5rem'
                                        }}
                                    >
                                        {(profile?.full_name || user?.username || '?')[0].toUpperCase()}
                                    </div>
                                    <div className="text-center text-md-start">
                                        <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-text)' }}>
                                            {profile?.full_name || 'Anonymous User'}
                                        </h2>
                                        <p className="text-muted mb-2 fs-5">@{user?.username}</p>
                                        <Badge bg="primary" className="px-3 py-2 rounded-pill opacity-75">
                                            {profile?.user_type || 'Community Member'}
                                        </Badge>
                                    </div>
                                    <div className="ms-md-auto mt-4 mt-md-0">
                                        <Button
                                            variant="outline-primary"
                                            className="px-4 py-2 fw-bold rounded-pill transition-bounce"
                                            onClick={() => navigate('/profile-update')}
                                        >
                                            <i className="bi bi-pencil-square me-2"></i>
                                            Edit Profile
                                        </Button>
                                    </div>
                                </div>



                                <Row className="g-4">
                                    <Col md={6}>
                                        <div className="mb-4">
                                            <label className="text-muted small fw-bold text-uppercase mb-1 d-block" style={{ letterSpacing: '0.05rem' }}>
                                                Email Address
                                            </label>
                                            <div className="fs-5 fw-medium" style={{ color: 'var(--primary-text)' }}>
                                                {user?.username && user.username.includes('@') ? user.username : 'N/A'}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-4">
                                            <label className="text-muted small fw-bold text-uppercase mb-1 d-block" style={{ letterSpacing: '0.05rem' }}>
                                                Phone Number
                                            </label>
                                            <div className="fs-5 fw-medium" style={{ color: 'var(--primary-text)' }}>
                                                {profile?.phone_number || 'Not Provided'}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <div className="mb-0">
                                            <label className="text-muted small fw-bold text-uppercase mb-1 d-block" style={{ letterSpacing: '0.05rem' }}>
                                                Account ID
                                            </label>
                                            <div className="text-muted font-monospace small">
                                                {user?.id || '---'}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <hr className="my-3 opacity-10" />
                                    </Col>
                                    <Col md={12}>
                                        <div className="mb-4">
                                            <label className="text-muted small fw-bold text-uppercase mb-1 d-block" style={{ letterSpacing: '0.05rem' }}>
                                                Address / Primary Area
                                            </label>
                                            <div className="fs-5 fw-medium" style={{ color: 'var(--primary-text)', lineHeight: '1.6' }}>
                                                {profile?.address || 'No address specified'}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
