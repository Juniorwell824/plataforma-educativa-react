// src/pages/admin/AdminStats.jsx (versión sin recharts)
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import '../../styles/AdminStats.css';

const AdminStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    byYear: {},
    byStatus: { active: 0, penalized: 0 },
    byMonth: [],
    progressStats: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const studentsRef = collection(db, 'users');
      const q = query(studentsRef, where('rol', '==', 'estudiante'));
      const querySnapshot = await getDocs(q);
      
      const students = [];
      const byYear = {};
      const byStatus = { active: 0, penalized: 0 };
      
      querySnapshot.forEach((doc) => {
        const student = doc.data();
        students.push(student);
        
        // Contar por año
        const year = student.año || 'N/A';
        byYear[year] = (byYear[year] || 0) + 1;
        
        // Contar por estado
        if (student.penalizado) {
          byStatus.penalized++;
        } else {
          byStatus.active++;
        }
      });

      // Preparar datos para mostrar
      const yearData = Object.keys(byYear).map(year => ({
        name: `Año ${year}`,
        value: byYear[year],
        color: getYearColor(year)
      }));

      setStats({
        total: students.length,
        byYear: yearData,
        byStatus,
        rawData: {
          byYear,
          byStatus
        }
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYearColor = (year) => {
    const colors = {
      '1': '#3498db',
      '2': '#9b59b6',
      '3': '#2ecc71',
      '4': '#f39c12',
      '5': '#e74c3c',
      'N/A': '#95a5a6'
    };
    return colors[year] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="admin-stats">
      <header className="page-header">
        <div>
          <h1>Estadísticas Detalladas</h1>
          <p>Análisis completo del sistema educativo</p>
        </div>
        <button className="btn btn-primary" onClick={loadStats}>
          <i className="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </header>

      <div className="stats-summary">
        <div className="summary-card total">
          <h3>{stats.total}</h3>
          <p>Total Estudiantes</p>
        </div>
        <div className="summary-card active">
          <h3>{stats.rawData?.byStatus?.active || 0}</h3>
          <p>Estudiantes Activos</p>
          <small>{stats.total > 0 ? Math.round((stats.rawData?.byStatus?.active / stats.total) * 100) : 0}%</small>
        </div>
        <div className="summary-card penalized">
          <h3>{stats.rawData?.byStatus?.penalized || 0}</h3>
          <p>Estudiantes Penalizados</p>
          <small>{stats.total > 0 ? Math.round((stats.rawData?.byStatus?.penalized / stats.total) * 100) : 0}%</small>
        </div>
      </div>

      {/* Estadísticas por año - Gráfico simple */}
      <div className="chart-card">
        <div className="chart-header">
          <h4>Distribución por Año</h4>
        </div>
        <div className="chart-simple">
          {stats.byYear.map((item, index) => (
            <div key={index} className="year-bar">
              <div className="year-label-bar">{item.name}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{
                    width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
              <div className="year-count">
                {item.value} estudiantes
                ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
              </div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          {stats.byYear.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: item.color }}></span>
              <span>{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas por estado */}
      <div className="chart-card">
        <div className="chart-header">
          <h4>Estado de Estudiantes</h4>
        </div>
        <div className="stats-breakdown">
          <div className="breakdown-card">
            <h5>Resumen de Estado</h5>
            <div className="breakdown-item">
              <span className="breakdown-label">Activos</span>
              <span className="breakdown-value" style={{ color: '#27ae60' }}>
                {stats.rawData?.byStatus?.active || 0}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Penalizados</span>
              <span className="breakdown-value" style={{ color: '#e74c3c' }}>
                {stats.rawData?.byStatus?.penalized || 0}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Total</span>
              <span className="breakdown-value">
                {stats.total}
              </span>
            </div>
          </div>
          
          <div className="breakdown-card">
            <h5>Porcentajes</h5>
            <div className="breakdown-item">
              <span className="breakdown-label">% Activos</span>
              <span className="breakdown-value">
                {stats.total > 0 ? Math.round((stats.rawData?.byStatus?.active / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">% Penalizados</span>
              <span className="breakdown-value">
                {stats.total > 0 ? Math.round((stats.rawData?.byStatus?.penalized / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla detallada por año */}
      <div className="detailed-table">
        <h4>Detalle por Año</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Año</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
              <th>Distribución</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.rawData?.byYear || {}).map(([year, count]) => (
              <tr key={year}>
                <td>
                  <span 
                    className="year-badge"
                    style={{ 
                      backgroundColor: getYearColor(year) + '20', 
                      color: getYearColor(year) 
                    }}
                  >
                    Año {year}
                  </span>
                </td>
                <td><strong>{count}</strong></td>
                <td>
                  {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                </td>
                <td>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ 
                        width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                        backgroundColor: getYearColor(year)
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStats;