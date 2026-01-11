import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();


  // AGREGAR ESTOS LOGS
  console.log('🔒 PrivateRoute - INICIO:', {
    pathname: location.pathname,
    loading: loading,
    hasCurrentUser: !!currentUser,
    currentUserEmail: currentUser?.email,
    currentUserUID: currentUser?.uid,
    timestamp: new Date().toISOString()
  });




  if (loading) {
    console.log('⏳ PrivateRoute: Loading...');
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('❌ PrivateRoute: NO HAY USUARIO, redirigiendo a /login');
    console.log('📍 Desde:', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar si es admin
  const isAdmin = () => {
    const adminEmails = ['admin@sysscholar.com', 'administrador@sysscholar.com'];
    return adminEmails.includes(currentUser.email?.toLowerCase()) ||
      currentUser?.rol === 'admin';
  };

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/select-year" />;
  }

  console.log('✅ PrivateRoute: ACCESO PERMITIDO para:', currentUser.email);
  return children;
};

export default PrivateRoute;