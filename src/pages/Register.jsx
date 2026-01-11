import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import '../../src/styles/Register.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    edad: '',
    correo: '',
    cedula: '',
    celular: '',
    password: '',
    confirmPassword: '',
    anio: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre completo es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres';
    }
    
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El usuario es requerido';
    } else if (formData.usuario.length < 4) {
      newErrors.usuario = 'Mínimo 4 caracteres';
    }
    
    if (!formData.edad) {
      newErrors.edad = 'La edad es requerida';
    } else if (formData.edad < 12 || formData.edad > 25) {
      newErrors.edad = 'Edad debe estar entre 12 y 25 años';
    }
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }
    
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!/^\d{10}$/.test(formData.cedula)) {
      newErrors.cedula = 'Cédula debe tener 10 dígitos';
    }
    
    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es requerido';
    } else if (!/^\d{10}$/.test(formData.celular)) {
      newErrors.celular = 'Celular debe tener 10 dígitos';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.anio) {
      newErrors.anio = 'Selecciona el año escolar';
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
      // Preparar datos para enviar (sin confirmPassword)
      const { confirmPassword, ...userData } = formData;
      
      const result = await register(userData);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          html: `
            <p>Bienvenido <strong>${result.user.nombre}</strong></p>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <small class="text-muted">Serás redirigido al login...</small>
          `,
          timer: 3000,
          showConfirmButton: false
        });
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
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

  return (
    <div className="register-page">
      {/* Navbar */}
      <nav className="navbar navbar-dark fixed-top">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <i className="fas fa-laptop-code me-2"></i>Sys Scholar
          </Link>
          <Link to="/" className="btn btn-outline-light btn-sm">
            <i className="fas fa-home me-1"></i> Inicio
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero text-center text-white">
        <div className="container">
          <h1 className="fw-bold">Registro de Estudiantes</h1>
          <p className="lead mb-0">Crea tu cuenta para acceder a la plataforma</p>
        </div>
      </section>

      {/* Register Form */}
      <main className="register-container">
        <div className="card shadow-lg register-card bg-white">
          <h3 className="text-center fw-bold mb-2">Registro</h3>
          <p className="text-center text-muted mb-4">Completa todos los campos</p>

          <form onSubmit={handleSubmit}>
            {/* Nombre y Usuario */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre completo *</label>
                <input 
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  name="nombre"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.nombre && (
                  <div className="invalid-feedback">{errors.nombre}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Usuario *</label>
                <input 
                  className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                  name="usuario"
                  placeholder="juan.perez"
                  value={formData.usuario}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.usuario && (
                  <div className="invalid-feedback">{errors.usuario}</div>
                )}
              </div>
            </div>

            {/* Edad y Correo */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Edad *</label>
                <input 
                  type="number" 
                  className={`form-control ${errors.edad ? 'is-invalid' : ''}`}
                  name="edad"
                  placeholder="16"
                  min="12"
                  max="25"
                  value={formData.edad}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.edad && (
                  <div className="invalid-feedback">{errors.edad}</div>
                )}
              </div>
              <div className="col-md-8 mb-3">
                <label className="form-label">Correo electrónico *</label>
                <input 
                  type="email" 
                  className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                  name="correo"
                  placeholder="correo@ejemplo.com"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.correo && (
                  <div className="invalid-feedback">{errors.correo}</div>
                )}
              </div>
            </div>

            {/* Cédula */}
            <div className="mb-3">
              <label className="form-label">Cédula *</label>
              <input 
                className={`form-control ${errors.cedula ? 'is-invalid' : ''}`}
                name="cedula"
                placeholder="1234567890"
                value={formData.cedula}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.cedula && (
                <div className="invalid-feedback">{errors.cedula}</div>
              )}
              <small className="text-muted">10 dígitos sin guiones</small>
            </div>

            {/* Celular */}
            <div className="mb-3">
              <label className="form-label">Número de celular *</label>
              <input 
                className={`form-control ${errors.celular ? 'is-invalid' : ''}`}
                name="celular"
                placeholder="0987654321"
                value={formData.celular}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.celular && (
                <div className="invalid-feedback">{errors.celular}</div>
              )}
              <small className="text-muted">10 dígitos</small>
            </div>

            {/* Contraseñas */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Contraseña *</label>
                <input 
                  type="password" 
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Confirmar contraseña *</label>
                <input 
                  type="password" 
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  name="confirmPassword"
                  placeholder="Repite la contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            {/* Año escolar */}
            <div className="mb-4">
              <label className="form-label">Año escolar *</label>
              <select 
                className={`form-select ${errors.anio ? 'is-invalid' : ''}`}
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seleccione año escolar</option>
                <option value="1">1ro Bachillerato</option>
                <option value="2">2do Bachillerato</option>
              </select>
              {errors.anio && (
                <div className="invalid-feedback">{errors.anio}</div>
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
                  Registrando...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-1"></i> Registrarse
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            ¿Ya tienes cuenta?
            <Link to="/login" className="fw-semibold ms-1"> Inicia sesión</Link>
          </p>
          
          <div className="mt-3 text-center">
            <small className="text-muted">
              * Todos los campos son obligatorios
            </small>
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

export default Register;