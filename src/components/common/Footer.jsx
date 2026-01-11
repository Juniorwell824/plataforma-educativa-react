import React from 'react';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3" style={{ backgroundColor: '#1e293b' }}>
      <div className="container text-center">
        <span className="text-light">
          © {new Date().getFullYear()} Sys Scholar - Plataforma Educativa. Todos los derechos reservados.
        </span>
        <div className="mt-2">
          <small className="text-muted">
            Desarrollado con React & Firebase
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;