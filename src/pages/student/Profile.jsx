import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import '../../styles/Perfil.css';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    edad: '',
    cedula: '',
    celular: '',
    email: ''
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (currentUser) {
      setFormData({
        nombre: currentUser.nombre || '',
        usuario: currentUser.usuario || '',
        edad: currentUser.edad || '',
        cedula: currentUser.cedula || '',
        celular: currentUser.celular || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre es requerido',
        confirmButtonColor: '#dc2626'
      });
      setLoading(false);
      return;
    }

    if (formData.edad < 15 || formData.edad > 80) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La edad debe estar entre 15 y 80 años',
        confirmButtonColor: '#dc2626'
      });
      setLoading(false);
      return;
    }

    try {
      // TODO: Implementar actualización en Firestore
      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Los cambios se han guardado correctamente.',
        confirmButtonColor: '#30297A'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Mi Perfil</h2>
        <p>Gestiona tu información personal</p>
      </div>

      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            <img 
              src={currentUser.fotoURL || `https://ui-avatars.com/api/?name=${currentUser.nombre}&background=30297A&color=fff`} 
              alt="Avatar" 
            />
            <button className="btn-change-photo">Cambiar foto</button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label>Nombre de Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    className="form-control"
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Edad</label>
                  <input
                    type="number"
                    name="edad"
                    className="form-control"
                    value={formData.edad}
                    onChange={handleChange}
                    min="15"
                    max="80"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    className="form-control"
                    value={formData.cedula}
                    onChange={handleChange}
                    pattern="\d{10}"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Celular</label>
                  <input
                    type="text"
                    name="celular"
                    className="form-control"
                    value={formData.celular}
                    onChange={handleChange}
                    pattern="\d{10}"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                  <small className="text-muted">El correo no se puede modificar</small>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                type="submit" 
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => window.history.back()}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className="profile-stats">
          <h4>Estadísticas</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{currentUser.progreso?.año1?.nivelesCompletados || 0}/5</span>
              <span className="stat-label">Niveles Año 1</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{currentUser.progreso?.año2?.nivelesCompletados || 0}/6</span>
              <span className="stat-label">Niveles Año 2</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{currentUser.rol}</span>
              <span className="stat-label">Rol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;