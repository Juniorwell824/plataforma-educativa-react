import React from 'react';
import '../../styles/AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>
      <div className="auth-container">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;