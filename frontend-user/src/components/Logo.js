import React from 'react';
import './Logo.css';

const Logo = ({ className = '', style = {}, fontSize = '1.3rem' }) => {
  return (
    <div className={`logo-css ${className}`} style={{ ...style, fontSize }}>
      <span className="logo-jan">Jan</span>
      <span className="logo-drishti">Drishti</span>
      <div className="logo-jd-badge">JD</div>
    </div>
  );
};

export default Logo;