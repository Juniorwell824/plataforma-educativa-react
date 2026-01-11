import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import '../../src/styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, userData } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (userData) {
      redirectUser(userData.rol);
    }
  }, [userData]);

  const redirectUser = (rol) => {
    if (rol === 'admin') {
      navigate('/admin/dashboard');
    } else if (rol === 'estudiante') {
      navigate('/student/select-year');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor corrige los errores en el formulario',
        timer: 3000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${result.user.nombre}`,
          timer: 2000,
          showConfirmButton: false
        });
        
        // Redirección basada en rol
        redirectUser(result.user.rol);
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: result.error,
          timer: 4000
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'Ocurrió un error inesperado. Intenta nuevamente.',
        timer: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    
    const demoCredentials = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      student: { email: 'estudiante@demo.com', password: 'estudiante123' }
    };
    
    try {
      const creds = demoCredentials[role];
      const result = await login(creds.email, creds.password);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Modo demo!',
          text: `Accediendo como ${role === 'admin' ? 'Administrador' : 'Estudiante'}`,
          timer: 2000,
          showConfirmButton: false
        });
        redirectUser(result.user.rol);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Demo no disponible',
        text: 'Configura usuarios demo en Firebase primero',
        timer: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <a className="navbar-brand" href="/">
            <i className="fas fa-laptop-code me-2"></i>Sys Scholar
          </a>
          <Link to="/" className="btn btn-outline-light btn-sm">
            <i className="fas fa-home me-1"></i> Inicio
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero text-center text-white">
        <div className="container">
          <h1 className="fw-bold">Acceso a la Plataforma</h1>
          <p className="lead mb-0">Inicia sesión para continuar</p>
        </div>
      </section>

      {/* Login Form */}
      <main className="login-container">
        <div className="card shadow-lg login-card bg-white">
          <h3 className="text-center fw-bold mb-2">Iniciar Sesión</h3>
          <p className="text-center text-muted mb-4">Accede a tu Dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="correo@ejemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Ingresa tu contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-success w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-1"></i> Ingresar
                </>
              )}
            </button>
          </form>

          {/* Botones de demo (opcional) */}
          <div className="mt-3">
            <p className="text-center text-muted mb-2">Acceso rápido (demo):</p>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary flex-fill"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
              >
                Admin Demo
              </button>
              <button 
                className="btn btn-outline-secondary flex-fill"
                onClick={() => handleDemoLogin('student')}
                disabled={loading}
              >
                Estudiante Demo
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-center mb-1">
              <Link to="/reset-password" className="text-decoration-none">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
            <p className="text-center mt-3 mb-0">
              ¿No tienes cuenta?
              <Link to="/register" className="fw-semibold ms-1"> Regístrate</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        © {new Date().getFullYear()} Sys Scholar - Plataforma Educativa
      </footer>
    </div>
  );
}

export default Login;