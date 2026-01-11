// src/pages/admin/AdminDashboard.jsx - VERSIÓN SIMPLIFICADA DE PRUEBA
import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    studentsByYear: { 1: 0, 2: 0 },
    completionRate: 0
  });
  
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Cargando datos...');
    
    try {
      console.log('🔍 Iniciando carga de datos reales...');
      
      // 1. Obtener estadísticas REALES
      const realStats = await adminService.getStats();
      console.log('📊 Estadísticas obtenidas:', realStats);
      
      // 2. Obtener estudiantes recientes REALES
      const realRecentStudents = await adminService.getRecentStudents(5);
      console.log('👥 Estudiantes recientes:', realRecentStudents);
      
      // 3. Obtener TODOS los estudiantes para debug
      const allStudents = await adminService.getAllStudents();
      console.log('📋 Todos los estudiantes:', allStudents);
      
      // Actualizar estado con datos REALES
      setStats({
        totalStudents: realStats.totalStudents || 0,
        activeStudents: realStats.activeStudents || 0,
        studentsByYear: realStats.studentsByYear || {1: 0, 2: 0},
        completionRate: realStats.completionRate || 0,
        newThisMonth: realStats.newThisMonth || 0
      });
      
      setRecentStudents(realRecentStudents);
      
      // Información de debug
      setDebugInfo(`
        ✅ Datos cargados exitosamente
        Total estudiantes: ${realStats.totalStudents}
        Estudiantes encontrados: ${allStudents.length}
        Primer estudiante: ${allStudents[0]?.nombre || 'Ninguno'}
      `);
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError(`Error: ${error.message}`);
      setDebugInfo(`❌ Error: ${error.message}`);
      
      // Datos de fallback mientras se soluciona
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        studentsByYear: {1: 0, 2: 0},
        completionRate: 0,
        newThisMonth: 0
      });
      setRecentStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getYearColor = (year) => {
    return year === 1 ? '#3498db' : '#9b59b6';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Conectando con Firebase...</p>
        <p className="small text-muted">{debugInfo}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard de Administración</h1>
        <p>Datos en tiempo real desde Firebase</p>
        <div className="d-flex gap-2 mt-2">
          <button 
            className="btn btn-sm btn-primary"
            onClick={loadRealData}
          >
            <i className="bi bi-arrow-clockwise"></i> Actualizar
          </button>
          <button 
            className="btn btn-sm btn-outline-info"
            onClick={() => {
              console.log('📊 Stats:', stats);
              console.log('👥 Recent:', recentStudents);
            }}
          >
            <i className="bi bi-bug"></i> Debug
          </button>
        </div>
        
        {/* Debug info */}
        {debugInfo && (
          <div className="mt-3 alert alert-info py-2" style={{ fontSize: '0.85rem' }}>
            <small>{debugInfo}</small>
          </div>
        )}
        
        {error && (
          <div className="mt-3 alert alert-danger py-2">
            <small>{error}</small>
          </div>
        )}
      </header>

      {/* Stats Cards - DATOS REALES */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Estudiantes</p>
            <small>Registrados en el sistema</small>
          </div>
        </div>

        <div className="stat-card stat-active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeStudents}</h3>
            <p>Estudiantes Activos</p>
            <small>{stats.completionRate}% del total</small>
          </div>
        </div>

        <div className="stat-card stat-year">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.studentsByYear[1] || 0}</h3>
            <p>1° Bachillerato</p>
            <small>Estudiantes en primer año</small>
          </div>
        </div>

        <div className="stat-card stat-rate">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.studentsByYear[2] || 0}</h3>
            <p>2° Bachillerato</p>
            <small>Estudiantes en segundo año</small>
          </div>
        </div>
      </div>

      {/* Distribución por año - DATOS REALES */}
      <div className="chart-container">
        <div className="chart-header">
          <h4>Distribución por Año</h4>
          <span className="badge bg-info">Datos en vivo</span>
        </div>
        <div className="chart-simple">
          {[1, 2].map(year => (
            <div key={year} className="year-bar">
              <div className="year-label-bar">Año {year}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{
                    width: `${stats.totalStudents > 0 ? 
                      ((stats.studentsByYear[year] || 0) / stats.totalStudents) * 100 : 0}%`,
                    backgroundColor: getYearColor(year)
                  }}
                ></div>
              </div>
              <div className="year-count">
                {stats.studentsByYear[year] || 0} estudiantes
                ({stats.totalStudents > 0 ? 
                  Math.round(((stats.studentsByYear[year] || 0) / stats.totalStudents) * 100) : 0}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estudiantes Recientes - DATOS REALES */}
      <div className="recent-students">
        <div className="recent-header">
          <h4>Estudiantes Recientes</h4>
          <a href="/admin/students" className="view-all">Ver todos →</a>
        </div>
        
        {recentStudents.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-people display-4 text-muted"></i>
            <p className="mt-3">No hay estudiantes registrados</p>
            <button className="btn btn-sm btn-outline-primary" onClick={loadRealData}>
              <i className="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        ) : (
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Año</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map(student => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.nombre}</strong>
                      <br/>
                      <small className="text-muted">{student.usuario || 'Sin usuario'}</small>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      <span className={`year-badge year-${student.año}`}>
                        Año {student.año}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${student.penalizado ? 'penalized' : 'active'}`}>
                        {student.penalizado ? 'Penalizado' : 'Activo'}
                      </span>
                    </td>
                    <td>{student.ultimoAccesoFormatted || 'Nunca'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información del sistema */}
      <div className="year-breakdown">
        <h4>Resumen del Sistema</h4>
        <div className="year-cards">
          <div className="year-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="year-number">{stats.totalStudents}</div>
            <div className="year-label">Total Registrados</div>
            <div className="year-percentage">100%</div>
          </div>
          <div className="year-card" style={{ borderLeft: '4px solid #2ecc71' }}>
            <div className="year-number">{stats.activeStudents}</div>
            <div className="year-label">Activos</div>
            <div className="year-percentage">{stats.completionRate}%</div>
          </div>
          <div className="year-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="year-number">{stats.totalStudents - stats.activeStudents}</div>
            <div className="year-label">Inactivos</div>
            <div className="year-percentage">{100 - stats.completionRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;