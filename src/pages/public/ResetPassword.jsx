import React, { useState, useContext } from 'react'; // AÑADIR useContext
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext'; // AÑADIR

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useContext(AuthContext); // AÑADIR

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email); // USAR resetPassword del contexto
      Swal.fire({
        icon: 'success',
        title: '¡Correo enviado!',
        text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        confirmButtonColor: '#30297A'
      });
      setEmail('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // ... resto del código igual ...
};

export default ResetPassword;