// src/pages/admin/AdminEditStudent.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Swal from 'sweetalert2';
import '../../styles/AdminEditStudent.css';

const AdminEditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    usuario: '',
    cedula: '',
    celular: '',
    edad: '',
    año: '1',
    penalizado: false,
    motivoPenalizacion: ''
  });

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const student = await adminService.getStudentById(id);
      
      if (student) {
        setFormData({
          nombre: student.nombre || '',
          email: student.email || '',
          usuario: student.usuario || '',
          cedula: student.cedula || '',
          celular: student.celular || '',
          edad: student.edad || '',
          año: student.año || '1',
          penalizado: student.penalizado || false,
          motivoPenalizacion: student.motivoPenalizacion || ''
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Estudiante no encontrado'
        });
        navigate('/admin/students');
      }
    } catch (error) {
      console.error('Error cargando estudiante:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del estudiante'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateStudent(id, formData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Los cambios se guardaron correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      
      setTimeout(() => {
        navigate('/admin/students');
      }, 1600);
    } catch (error) {
      console.error('Error guardando cambios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los cambios'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Descartar cambios?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/students');
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando información del estudiante...</p>
      </div>
    );
  }

  return (
    <div className="edit-student">
      <header className="page-header">
        <div>
          <h1>Editar Estudiante</h1>
          <p>Modifica la información del estudiante</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : 'Guardar Cambios'}
          </button>
        </div>
      </header>

      <div className="edit-container">
        <div className="student-profile">
          <div className="profile-header">
            <div className="profile-avatar">
              {formData.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h3>{formData.nombre}</h3>
              <p>{formData.email}</p>
              <span className={`status-badge ${formData.penalizado ? 'penalized' : 'active'}`}>
                {formData.penalizado ? 'Penalizado' : 'Activo'}
              </span>
            </div>
          </div>
        </div>

        <div className="edit-form">
          <div className="form-section">
            <h4>Información Personal</h4>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Nombre Completo *</label>
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
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label>Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    className="form-control"
                    value={formData.usuario}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    className="form-control"
                    value={formData.cedula}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label>Edad</label>
                  <input
                    type="number"
                    name="edad"
                    className="form-control"
                    value={formData.edad}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Información Académica</h4>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Año de Estudio</label>
                  <select
                    name="año"
                    className="form-select"
                    value={formData.año}
                    onChange={handleChange}
                  >
                    <option value="1">Año 1</option>
                    <option value="2">Año 2</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Teléfono / Celular</label>
                  <input
                    type="tel"
                    name="celular"
                    className="form-control"
                    value={formData.celular}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Estado del Estudiante</h4>
            <div className="row">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="penalizado"
                    className="form-check-input"
                    id="penalizado"
                    checked={formData.penalizado}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="penalizado">
                    Estudiante Penalizado
                  </label>
                </div>
              </div>
            </div>
            
            {formData.penalizado && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="form-group">
                    <label>Motivo de Penalización</label>
                    <textarea
                      name="motivoPenalizacion"
                      className="form-control"
                      rows="3"
                      value={formData.motivoPenalizacion}
                      onChange={handleChange}
                      placeholder="Describe el motivo de la penalización..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditStudent;