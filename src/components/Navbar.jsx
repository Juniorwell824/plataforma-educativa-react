import React from 'react';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        <a className="navbar-brand" href="/">
          <i className="fas fa-laptop-code me-2"></i>Plataforma Informática
        </a>
        <a href="/" className="btn btn-outline-light btn-sm">
          <i className="fas fa-home me-1"></i> Inicio
        </a>
      </div>
    </nav>
  );
}

export default Navbar;