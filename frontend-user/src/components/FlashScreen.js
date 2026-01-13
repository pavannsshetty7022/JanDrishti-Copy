import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const FlashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: 'var(--background-color)',
        color: 'var(--primary-color)',
      }}
    >
      <Logo fontSize="3rem" className="mb-4 animate__animated animate__pulse animate__infinite" />
      <h4 className="text-muted tracking-widest text-uppercase small fw-bold">Community Issue Tracker</h4>
    </div>
  );
};

export default FlashScreen;
