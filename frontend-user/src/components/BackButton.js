import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    if (location.pathname === '/home' || location.pathname === '/') {
        return null;
    }

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(user ? '/dashboard' : '/home');
        }
    };

    return (
        <div className="mb-4">
            <Button
                variant="outline-secondary"
                onClick={handleBack}
                className="d-flex align-items-center gap-2"
                style={{
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                }}
            >
                <i className="bi bi-arrow-left"></i>
                Back
            </Button>
        </div>
    );
};

export default BackButton;
