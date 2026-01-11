// src/pages/admin/AdminStudents.jsx
import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../styles/AdminStudents.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, yearFilter, statusFilter, sortBy]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await adminService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los estudiantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = async () => {
    try {
      const filtered = await adminService.searchStudents(searchTerm, yearFilter, statusFilter);
      
      // Ordenar
      const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.nombre || '').localeCompare(b.nombre || '');
          case 'year':
            return (a.año || '').localeCompare(b.año || '');
          case 'date':
            const dateA = adminService.parseFirebaseTimestamp(a.fechaRegistro);
            const dateB = adminService.parseFirebaseTimestamp(b.fechaRegistro);
            return dateB.getTime() - dateA.getTime();
          case 'lastAccess':
            const lastA = adminService.parseFirebaseTimestamp(a.ultimoAcceso);
            const lastB = adminService.parseFirebaseTimestamp(b.ultimoAcceso);
            return lastB.getTime() - lastA.getTime();
          default:
            return 0;
        }
      });

      setFilteredStudents(sorted);
    } catch (error) {
      console.error('Error filtrando estudiantes:', error);
    }
  };

  const handlePenalize = async (studentId, penalized) => {
    const result = await Swal.fire({
      title: penalized ? '¿Activar estudiante?' : '¿Penalizar estudiante?',
      text: penalized 
        ? 'El estudiante podrá acceder nuevamente al sistema'
        : 'El estudiante no podrá acceder al sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const updates = {
          penalizado: !penalized,
          motivoPenalizacion: !penalized ? 'Penalizado por administrador' : ''
        };
        
        await adminService.updateStudent(studentId, updates);
        
        // Actualizar lista local
        const updatedStudents = students.map(student => 
          student.id === studentId 
            ? { ...student, ...updates }
            : student
        );
        
        setStudents(updatedStudents);
        
        Swal.fire({
          icon: 'success',
          title: '¡Listo!',
          text: penalized ? 'Estudiante activado' : 'Estudiante penalizado',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error actualizando estudiante:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estudiante'
        });
      }
    }
  };

  const handleRefresh = () => {
    loadStudents();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="admin-students">
      <header className="page-header">
        <div>
          <h1>Gestión de Estudiantes</h1>
          <p>{students.length} estudiantes registrados en el sistema</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleRefresh}>
            <i className="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Buscar por nombre, email, cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select 
            className="form-select" 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">Todos los años</option>
            <option value="1">Año 1</option>
            <option value="2">Año 2</option>
            <option value="3">Año 3</option>
            <option value="4">Año 4</option>
            <option value="5">Año 5</option>
          </select>

          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo activos</option>
            <option value="penalized">Solo penalizados</option>
          </select>

          <select 
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Ordenar por nombre</option>
            <option value="year">Ordenar por año</option>
            <option value="date">Ordenar por fecha registro</option>
            <option value="lastAccess">Ordenar por último acceso</option>
          </select>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="students-table-container">
        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Año</th>
                <th>Usuario</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="no-results">
                      <i className="bi bi-people"></i>
                      <p>No se encontraron estudiantes</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name">
                        <strong>{student.nombre || 'Sin nombre'}</strong>
                        <small>Edad: {student.edad || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      <span className={`year-badge year-${student.año}`}>
                        Año {student.año || 'N/A'}
                      </span>
                    </td>
                    <td>{student.usuario || 'N/A'}</td>
                    <td>{student.cedula || 'N/A'}</td>
                    <td>{student.celular || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${student.penalizado ? 'penalized' : 'active'}`}>
                        {student.penalizado ? 'Penalizado' : 'Activo'}
                      </span>
                    </td>
                    <td>
                      {adminService.formatDate(student.ultimoAcceso)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/students/${student.id}`}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button 
                          className={`btn-action ${student.penalizado ? 'btn-activate' : 'btn-penalize'}`}
                          onClick={() => handlePenalize(student.id, student.penalizado)}
                          title={student.penalizado ? 'Activar' : 'Penalizar'}
                        >
                          <i className={`bi ${student.penalizado ? 'bi-check-circle' : 'bi-slash-circle'}`}></i>
                        </button>
                        <button 
                          className="btn-action btn-view"
                          title="Ver progreso"
                          onClick={() => {
                            Swal.fire({
                              title: 'Progreso del Estudiante',
                              html: `
                                <div class="text-start">
                                  <p><strong>Nombre:</strong> ${student.nombre || 'N/A'}</p>
                                  <p><strong>Año:</strong> ${student.año || 'N/A'}</p>
                                  <p><strong>Estado:</strong> ${student.penalizado ? 'Penalizado' : 'Activo'}</p>
                                  ${student.progreso && student.progreso.año1 ? `
                                    <hr>
                                    <h6>Progreso Año 1:</h6>
                                    <p>Niveles completados: ${student.progreso.año1.nivelesCompletados || 0}/${student.progreso.año1.totalNiveles || 6}</p>
                                    <p>Promedio: ${student.progreso.año1.promedioPuntaje || 0}%</p>
                                  ` : ''}
                                </div>
                              `,
                              confirmButtonText: 'Cerrar'
                            });
                          }}
                        >
                          <i className="bi bi-graph-up"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información de paginación */}
      <div className="pagination-section">
        <div className="pagination-info">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;