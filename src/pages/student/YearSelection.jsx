import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import '../../styles/Seleccion.css';

const YearSelection = () => {
  const { currentUser, userData: contextUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [localUserData, setLocalUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // SOLUCIÓN: Cargar datos DIRECTAMENTE del documento principal
  useEffect(() => {
    const loadUserDataDirectly = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      console.log('🔍 Cargando datos DIRECTAMENTE para UID:', currentUser.uid);

      try {
        // 1. Cargar documento principal del usuario
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('✅ Datos cargados de Firestore:', data);
          console.log('📊 Progreso en documento:', data.progreso);
          
          // IMPORTANTE: Usar los datos DIRECTAMENTE de Firestore
          setLocalUserData(data);
        } else {
          console.log('⚠️ Documento no existe, usando contexto');
          // Si no existe en Firestore, usar datos del contexto
          setLocalUserData(contextUserData);
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        // Si hay error, usar datos del contexto
        setLocalUserData(contextUserData);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadUserDataDirectly();
    }
  }, [currentUser, navigate, contextUserData]);

  // Mostrar carga
  if (loading) {
    return (
      <div className="year-selection-container">
        <div className="selector-wrapper" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos
  if (!localUserData) {
    return (
      <div className="year-selection-container">
        <div className="selector-wrapper" style={{ textAlign: 'center', padding: '60px' }}>
          <h3>⚠️ No se pudieron cargar tus datos</h3>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/dashboard', { state: { selectedYear: 1 } })}
          >
            Continuar con Año 1
          </button>
        </div>
      </div>
    );
  }

  // Obtener progreso DIRECTAMENTE del documento
  const progresoAño1 = localUserData.progreso?.año1 || {};
  
  // ESTOS SON LOS DATOS QUE DEBE MOSTRAR (de tu imagen):
  // nivelesCompletados: 4
  // nivelesAprobados: 3  
  // totalNiveles: 6
  // completado: false
  
  const nivelesCompletados = progresoAño1.nivelesCompletados || 0;
  const nivelesAprobados = progresoAño1.nivelesAprobados || 0;
  const totalNiveles = progresoAño1.totalNiveles || 6;
  const completado = progresoAño1.completado || false;
  const porcentaje = totalNiveles > 0 ? Math.round((nivelesCompletados / totalNiveles) * 100) : 0;

  console.log('🎯 DATOS A MOSTRAR EN PANTALLA:');
  console.log('• Módulos completados:', nivelesCompletados);
  console.log('• Módulos aprobados:', nivelesAprobados);
  console.log('• Total módulos:', totalNiveles);
  console.log('• Año completado:', completado);
  console.log('• Porcentaje:', porcentaje + '%');

  // Definir años disponibles
  const years = [
    {
      id: 1,
      number: 1,
      title: 'Primero de Bachillerato',
      description: 'Accede a tus módulos, progreso académico y actividades asignadas.',
      tag: 'BACHILLERATO',
      available: true // Siempre disponible
    },
    {
      id: 2,
      number: 2,
      title: 'Segundo de Bachillerato',
      description: 'Continúa tu avance académico y revisa tus evaluaciones y certificados.',
      tag: 'BACHILLERATO',
      // Solo disponible si Año 1 está COMPLETADO (completado === true)
      available: completado
    }
  ];

  const handleYearSelect = async (yearId) => {
    setSelectedLoading(true);
    
    try {
      // Guardar año seleccionado
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          añoSeleccionado: yearId.toString(),
          ultimoAcceso: new Date().toISOString()
        });
      }

      // Redirigir
      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            selectedYear: yearId,
            yearTitle: yearId === 1 
              ? 'Primero de Bachillerato' 
              : 'Segundo de Bachillerato'
          }
        });
      }, 300);

    } catch (error) {
      console.error('Error:', error);
      setSelectedLoading(false);
    }
  };

  return (
    <div className="year-selection-container">
      <div className="selector-wrapper">
        
        <div className="selector-header">
          <h1>Selecciona tu año escolar</h1>
          <p>Accede a tu panel según el nivel académico asignado</p>
        </div>

        <div className="selector-grid">
          {years.map((year) => (
            <div
              key={year.id}
              className={`role-card ${!year.available ? 'card-disabled' : ''}`}
              onClick={() => !selectedLoading && year.available && handleYearSelect(year.id)}
              style={{ 
                cursor: selectedLoading || !year.available ? 'not-allowed' : 'pointer'
              }}
            >
              <div className="level-circle">
                {year.number}
                <div className="level-tag">{year.tag}</div>
              </div>

              <div className="role-title">{year.title}</div>
              <div className="role-desc">{year.description}</div>

              {!year.available && (
                <div className="locked-overlay">
                  <div className="lock-icon">🔒</div>
                  <div className="lock-text">Completa el Año 1 primero</div>
                  <small style={{ marginTop: '5px', fontSize: '12px' }}>
                    {totalNiveles - nivelesCompletados} módulos pendientes
                  </small>
                </div>
              )}

              <button
                className="role-btn"
                disabled={selectedLoading || !year.available}
                onClick={(e) => {
                  e.stopPropagation();
                  handleYearSelect(year.id);
                }}
              >
                {selectedLoading ? 'Cargando...' : 'Ingresar a mi panel'} <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {/* INFORMACIÓN DEL USUARIO - DATOS DIRECTOS DE FIRESTORE */}
        <div className="user-info-panel">
          <div className="user-badge">
            <strong>👤 Estudiante:</strong> {localUserData.nombre || localUserData.email}
          </div>
          
          <div className="user-badge">
            <strong>📧 Email:</strong> {localUserData.email}
          </div>

          {/* ESTA ES LA PARTE IMPORTANTE - MUESTRA 4/6 */}
          <div className="progress-info">
            <div className="progress-label">
              <strong>Progreso Año 1:</strong> {nivelesCompletados}/{totalNiveles} módulos
              {completado && (
                <span style={{ color: '#28a745', marginLeft: '10px' }}>✓ COMPLETADO</span>
              )}
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-fill"
                style={{
                  width: `${porcentaje}%`,
                  background: completado 
                    ? 'linear-gradient(90deg, #28a745, #20c997)' 
                    : 'linear-gradient(90deg, #4a6cf7, #6a11cb)'
                }}
              ></div>
            </div>
            
            {/* Información adicional */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666',
              marginTop: '8px'
            }}>
              <span><strong>Módulos aprobados:</strong> {nivelesAprobados}</span>
              {progresoAño1.promedioPuntaje > 0 && (
                <span><strong>Promedio:</strong> {progresoAño1.promedioPuntaje}%</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearSelection;