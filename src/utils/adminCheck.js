// utils/adminCheck.js
export const isAdminUser = (email, userData) => {
  // Lista de emails admin permitidos
  const adminEmails = [
    'admin@sysscholar.com',
    'administrador@sysscholar.com',
    // Agrega más emails admin aquí si es necesario
  ];
  
  // Verificar por email
  if (adminEmails.includes(email.toLowerCase())) {
    return true;
  }
  
  // Verificar por rol en userData
  if (userData?.rol === 'admin') {
    return true;
  }
  
  return false;
};

// Función para redirigir según rol
export const redirectByRole = (navigate, email, userData) => {
  if (isAdminUser(email, userData)) {
    navigate('/admin/dashboard');
  } else {
    navigate('/select-year');
  }
};