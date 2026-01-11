import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import { initializeStudentProgress } from '../../utils/initializeProgress'; // <-- Agregar esta línea
import AuthLayout from '../../components/common/AuthLayout'; // AÑADIR
import '../../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    edad: '',
    cedula: '',
    celular: '',
    email: '',
    password: '',
    confirmPassword: '',
    anio: '1'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.usuario.trim()) newErrors.usuario = 'El usuario es requerido';
    if (!formData.edad || formData.edad < 15 || formData.edad > 80) newErrors.edad = 'Edad inválida (15-80)';
    if (!formData.cedula || !/^\d{10}$/.test(formData.cedula)) newErrors.cedula = 'Cédula debe tener 10 dígitos';
    if (!formData.celular || !/^\d{10}$/.test(formData.celular)) newErrors.celular = 'Celular debe tener 10 dígitos';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /*   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }
  
      try {
        const result = await register(
          formData.email,
          formData.password,
          {
            nombre: formData.nombre,
            usuario: formData.usuario,
            edad: parseInt(formData.edad),
            cedula: formData.cedula,
            celular: formData.celular,
            año: '1',
            rol: 'estudiante',
            penalizado: false,
            motivoPenalizacion: '',
            progreso: {
              año1: {
                completado: false,
                nivelesAprobados: 0,
                nivelesCompletados: 0,
                promedioPuntaje: 0,
                totalNiveles: 6
              },
              año2: {
                completado: false,
                nivelesAprobados: 0,
                nivelesCompletados: 0,
                promedioPuntaje: 0,
                totalNiveles: 8
              }
            }
          }
        );
        if (result.success && result.user) {
          // Obtener el userId del objeto user
          const userId = result.user.uid;
  
          console.log('✅ Usuario registrado con UID:', userId);
  
          // Inicializar progreso con el UID correcto
          try {
            await initializeStudentProgress(userId, 1);
            console.log('✅ Progreso inicializado automáticamente');
          } catch (progressError) {
            console.warn('⚠️ Error inicializando progreso:', progressError);
            // No detenemos el registro si falla la inicialización
          }
  
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
            confirmButtonColor: '#30297A'
          }).then(() => {
            navigate('/login');
          });
        } else {
          throw new Error(result.error || 'Error en el registro');
        }
  
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error en registro',
          text: error.message || 'Ocurrió un error al registrar',
          confirmButtonColor: '#dc2626'
        });
      } finally {
        setLoading(false);
      }
    }; */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Preparar datos para registro
      const userData = {
        nombre: formData.nombre,
        usuario: formData.usuario,
        edad: parseInt(formData.edad),
        cedula: formData.cedula,
        celular: formData.celular,
        anio: formData.anio, // Año seleccionado
        rol: 'estudiante',
        penalizado: false,
        motivoPenalizacion: '',
        email: formData.email,
        password: formData.password
      };

      // Llamar al registro del AuthContext
      const result = await register(formData.email, formData.password, userData);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
          confirmButtonColor: '#30297A'
        }).then(() => {
          navigate('/login');
        });
      } else {
        throw new Error(result.error || 'Error en el registro');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error en registro',
        text: error.message || 'Ocurrió un error al registrar',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Crear Cuenta</h2>
            <p>Completa el formulario para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    placeholder="Ej: Juan Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="usuario">Nombre de Usuario *</label>
                  <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                    placeholder="Ej: juanperez"
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                  />
                  {errors.usuario && <div className="invalid-feedback">{errors.usuario}</div>}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="edad">Edad *</label>
                  <input
                    type="number"
                    id="edad"
                    name="edad"
                    className={`form-control ${errors.edad ? 'is-invalid' : ''}`}
                    placeholder="Ej: 25"
                    min="15"
                    max="80"
                    value={formData.edad}
                    onChange={handleChange}
                    required
                  />
                  {errors.edad && <div className="invalid-feedback">{errors.edad}</div>}
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="cedula">Cédula *</label>
                  <input
                    type="text"
                    id="cedula"
                    name="cedula"
                    className={`form-control ${errors.cedula ? 'is-invalid' : ''}`}
                    placeholder="10 dígitos"
                    maxLength="10"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                  />
                  {errors.cedula && <div className="invalid-feedback">{errors.cedula}</div>}
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="celular">Celular *</label>
                  <input
                    type="text"
                    id="celular"
                    name="celular"
                    className={`form-control ${errors.celular ? 'is-invalid' : ''}`}
                    placeholder="10 dígitos"
                    maxLength="10"
                    value={formData.celular}
                    onChange={handleChange}
                    required
                  />
                  {errors.celular && <div className="invalid-feedback">{errors.celular}</div>}
                </div>
              </div>
            </div>
            {/* NUEVO CAMPO: Selector de Año */}
            <div className="form-group">
              <label htmlFor="anio">Año de Estudio *</label>
              <select
                id="anio"
                name="anio"
                className={`form-control ${errors.anio ? 'is-invalid' : ''}`}
                value={formData.anio}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un año</option>
                <option value="1">1er Año</option>
                <option value="2">2do Año</option>
              </select>
              {errors.anio && <div className="invalid-feedback">{errors.anio}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="password">Contraseña *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repite la contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-register"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="login-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;