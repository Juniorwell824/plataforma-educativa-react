import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/common/AuthLayout'; // AÑADIR
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión exitosamente.',
        confirmButtonColor: '#30297A',
        timer: 1500,
        showConfirmButton: false
      });

      // Redirigir según el rol del usuario
      setTimeout(() => {

        const isAdmin = () => {
          // 1. Verificar por email específico
          const adminEmails = [
            'admin@sysscholar.com',
            'administrador@sysscholar.com'
          ];

          // 2. Verificar si el email contiene "admin"
          const emailIsAdmin = adminEmails.includes(email.toLowerCase()) ||
            email.toLowerCase().includes('admin@');

          // 3. Verificar en los datos del usuario si existe
          const userDataIsAdmin = result?.userData?.rol === 'admin';

          return emailIsAdmin || userDataIsAdmin;
        };

        console.log('DEBUG Login - Email:', email);
        console.log('DEBUG Login - Es admin?', isAdmin());

        if (isAdmin()) {
          console.log('🔄 Redirigiendo admin a /admin/dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('🔄 Redirigiendo estudiante a /select-year');
          navigate('/select-year');
        }

        /* if (result.userData) {
          if (result.userData?.rol === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Para estudiantes, redirigir a selección de año
            navigate('/select-year');
          }
        } else {
          // Si no hay datos de usuario, ir a selección de año por defecto
          navigate('/select-year');
        } */
      }, 1600);

    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Botón demo - SOLO PARA DESARROLLO
  const DemoButton = () => {
    const handleCreateDemo = async () => {
      try {
        const { initializeDemoData } = await import('../../utils/createDemoUsers');
        const result = await initializeDemoData();

        if (result.users.some(r => r.success)) {
          Swal.fire({
            icon: 'success',
            title: '¡Datos demo creados!',
            html: `
              <p>Usuarios creados exitosamente.</p>
              <p><strong>Credenciales:</strong></p>
              <p>Admin: admin@sysscholar.com / Admin123!</p>
              <p>Estudiante: estudiante@sysscholar.com / Estudiante123!</p>
            `,
            confirmButtonColor: '#30297A'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron crear los datos demo.',
          confirmButtonColor: '#dc2626'
        });
      }
    };

    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="mt-4 text-center border-top pt-3">
          <button
            onClick={handleCreateDemo}
            className="btn btn-outline-primary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            🚀 Crear Datos Demo (Solo Desarrollo)
          </button>
          <p className="text-muted mt-1 small">
            Usa: admin@sysscholar.com / Admin123!
            Estudiante: estudiante@sysscholar.com / Estudiante123!
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AuthLayout>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <Link to="/reset-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="register-link">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <DemoButton />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;