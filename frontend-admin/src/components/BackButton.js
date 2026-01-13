import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const BackButton = ({ fallbackPath = '/dashboard', label = 'Back' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();


    if (location.pathname === '/dashboard' || location.pathname === '/login') {
        return null;
    }

    const handleGoBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return (
        <Button
            variant="link"
            onClick={handleGoBack}
            className={`text-decoration-none fw-bold d-inline-flex align-items-center mb-3 px-0 ${isDarkMode ? 'text-light' : 'text-dark'
                }`}
            style={{
                width: 'fit-content',
                transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            aria-label="Go back"
        >
            <div
                className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light border'
                    }`}
                style={{ width: '32px', height: '32px' }}
            >
                <i className="bi bi-arrow-left"></i>
            </div>
            {label}
        </Button>
    );
};

export default BackButton;
