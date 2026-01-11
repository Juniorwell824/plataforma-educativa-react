import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDashboardData } from '../../services/dashboardService';
import Swal from 'sweetalert2';
import ModuleCard from '../../components/student/ModuleCard';
import ProgressChart from '../../components/student/ProgressChart';
import '../../styles/Dashboard.css';
// En Dashboard.jsx, importa las utilidades:
import { getModuleNumberFromId, getModuleTitleByNumber } from '../../utils/moduleMapper';

const Dashboard = () => {
  const { userData, currentUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener año seleccionado de la navegación
  const selectedYear = location.state?.selectedYear || userData?.añoSeleccionado || userData?.año || 1;
  const [activeSection, setActiveSection] = useState('inicio');
  const [dashboardData, setDashboardData] = useState(null);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarActive, setSidebarActive] = useState(window.innerWidth > 768);

  // Función auxiliar para iconos
  const getModuleIcon = (order) => {
    const icons = ['💻', '🔧', '⚙️', '📄', '🌐', '👨‍💻', '⚛️', '🔥', '🔌', '🚀', '💼', '🎯'];
    return icons[(order - 1) % icons.length] || '📚';
  };

  // Datos de respaldo (si Firebase falla)
  const getFallbackData = (year) => {
    console.log(`🔄 Creando datos de respaldo para año ${year}`);

    // Obtener progreso del usuario desde el contexto
    const yearKey = `año${year}`;
    const userProgress = userData?.progreso?.[yearKey] || {};

    // Crear módulos básicos
    const totalModules = userProgress.totalNiveles || (year === 1 ? 6 : 8);
    const completed = userProgress.nivelesCompletados || 0;
    const approved = userProgress.nivelesAprobados || 0;

    const modulesArray = [];
    for (let i = 1; i <= totalModules; i++) {
      let status = 'not-started';
      let progressValue = 0;

      if (i <= completed) {
        status = 'completed';
        progressValue = 100;
      } else if (i === completed + 1) {
        status = 'in-progress';
        progressValue = 50;
      }

      modulesArray.push({
        id: `${year === 1 ? '1ro' : '2do'}_modulo_${i}`,
        title: `Módulo ${i}`,
        description: `Contenido educativo del módulo ${i}`,
        status,
        progress: progressValue,
        icon: getModuleIcon(i),
        difficulty: i <= 2 ? 'básico' : i <= 4 ? 'intermedio' : 'avanzado',
        duration: '120 min',
        order: i
      });
    }

    // Calcular estadísticas
    const inProgress = completed > 0 && completed < totalModules ? 1 : 0;
    const notStarted = totalModules - completed - inProgress;
    const progressPercent = totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0;

    // Módulos próximos (primeros 3 no completados)
    const nextModules = modulesArray
      .filter(m => m.status !== 'completed')
      .slice(0, 3);

    // Módulos recientes (últimos 2 completados o en progreso)
    const recentModules = modulesArray
      .filter(m => m.status === 'completed' || m.status === 'in-progress')
      .slice(-2)
      .reverse();

    return {
      modules: modulesArray,
      nextModules,
      recentModules,
      stats: {
        total: totalModules,
        completed: completed,
        approved: approved,
        inProgress: inProgress,
        notStarted: notStarted,
        averageScore: userProgress.promedioPuntaje || 0,
        bestScore: userProgress.promedioPuntaje || 0,
        totalTimeSpent: 0
      },
      yearTitle: year === 1 ? 'Primero de Bachillerato' : 'Segundo de Bachillerato',
      canDownloadCertificate: userProgress.completado || completed === totalModules,
      progressPercent,
      yearProgress: userProgress
    };
  };

  // Cargar datos del dashboard desde Firebase
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser?.uid) {
        console.log('⚠️ No hay usuario, usando datos de respaldo');
        const fallbackData = getFallbackData(selectedYear);
        setDashboardData(fallbackData);
        setModules(fallbackData.modules || []);
        setFilteredModules(fallbackData.modules || []);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(`📊 Cargando dashboard REAL para año ${selectedYear}, usuario: ${currentUser.uid}`);

      try {
        const data = await getDashboardData(currentUser.uid, selectedYear);
        console.log('✅✅✅ Datos RECIBIDOS de Firebase (dashboardService):', data);

        // Verificar si tiene estados detallados
        if (data.hasDetailedStatus) {
          console.log('🎉 Estados detallados cargados correctamente');

          // Agrupar módulos por estado para logging
          const grouped = {
            aprobados: data.modules.filter(m => m.status === 'completed' && m.aprobado).length,
            reprobados: data.modules.filter(m => m.status === 'completed' && !m.aprobado).length,
            enProgreso: data.modules.filter(m => m.status === 'in-progress').length,
            porComenzar: data.modules.filter(m => m.status === 'not-started').length
          };

          console.log('📊 Distribución de estados:', grouped);
        }

        // Verificar si son datos reales o de respaldo
        if (data.isFallback) {
          console.log('⚠️ Se cargaron datos de respaldo (fallback)');
        } else {
          console.log('🎉 Se cargaron datos REALES de Firebase');
        }

        // Validar estructura
        if (!data || typeof data !== 'object') {
          console.error('❌ Datos inválidos recibidos');
          throw new Error('Estructura de datos inválida');
        }

        // Asegurar arrays
        const safeModules = Array.isArray(data.modules) ? data.modules : [];
        const safeStats = data.stats || {};

        console.log('📊 Estadísticas cargadas:', {
          total: safeStats.total,
          completed: safeStats.completed,
          approved: safeStats.approved,
          inProgress: safeStats.inProgress,
          avg: ((safeStats.approved / safeStats.total) * 100).toFixed(2)
        });

        setDashboardData(data);
        setModules(safeModules);
        setFilteredModules(safeModules);

      } catch (error) {
        console.error('❌ Error crítico cargando datos del dashboard:', error);
        console.log('🔄 Usando datos de respaldo locales...');

        // Usar datos de respaldo locales
        const fallbackData = getFallbackData(selectedYear);
        console.log('🔄 Datos de respaldo locales:', fallbackData);

        setDashboardData(fallbackData);
        setModules(fallbackData.modules || []);
        setFilteredModules(fallbackData.modules || []);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser, selectedYear]);

  // Filtrar módulos según búsqueda y estado
  useEffect(() => {
    if (!modules.length) return;

    let result = modules;

    if (searchTerm) {
      result = result.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(module => module.status === statusFilter);
    }

    setFilteredModules(result);
  }, [searchTerm, statusFilter, modules]);

  // Funciones de navegación
  const showSection = (section) => {
    setActiveSection(section);
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleSectionChange = (section) => {
    showSection(section);
    if (window.innerWidth <= 768) {
      setSidebarActive(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  /*   const handleModuleClick = async (moduleData) => {
      try {
        console.log(`📖 Navegando al módulo: ${moduleData.title}`);
  
        // Obtener número de módulo (1-6)
        const moduleNumber = moduleData.numeroModulo || moduleData.order || 1;
  
        // Preparar datos para el visor
        const navState = {
          moduleId: moduleData.id,
          moduleTitle: moduleData.title,
          year: selectedYear,
          testId: moduleNumber,
          isCompleted: moduleData.estado === 'aprobado' || moduleData.estado === 'reprobado',
          testInfo: moduleData.testInfo || null
        };
  
        console.log('🚀 Navegando con estado:', navState);
  
        // Navegar al visor de módulos
        navigate(`/module/${moduleNumber}`, {
          state: navState
        });
  
      } catch (error) {
        console.error('Error navegando al módulo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el módulo. Intenta nuevamente.',
          confirmButtonText: 'OK'
        });
      }
    }; */

  // Actualiza la función handleModuleClick:
  // En Dashboard.jsx, actualiza la función handleModuleClick:
  // En Dashboard.jsx, actualiza handleModuleClick:
  const handleModuleClick = async (moduleData) => {
    try {
      console.log('🔄 Módulo clickeado:', moduleData);

      const moduleNumber = moduleData.numeroModulo || moduleData.order || 1;

      // ¡SIEMPRE permitir tomar test y retomar!
      const navState = {
        moduleId: moduleData.id,
        moduleTitle: moduleData.title,
        year: selectedYear,
        testId: moduleNumber,
        moduleNumber: moduleNumber,
        // ¡FORZAR modo interactivo!
        isViewOnly: false,
        canTakeTest: true,
        canRetake: true,
        showRetakeOption: true,
        isRetake: moduleData.estado === 'aprobado' || moduleData.estado === 'reprobado',
        testInfo: moduleData.testInfo || null,
        previousScore: moduleData.testInfo?.porcentaje || 0
      };

      console.log('🚀 Navegando con modo INTERACTIVO:', navState);

      navigate(`/module/${moduleNumber}`, { state: navState });

    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo cargar el módulo', 'error');
    }
  };




  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard del año {selectedYear}...</p>
      </div>
    );
  }

  // Validar que dashboardData existe y tiene la estructura correcta
  if (!dashboardData || !dashboardData.modules) {
    return (
      <div className="dashboard-loading">
        <div className="error-message">
          <h3>❌ Error cargando datos</h3>
          <p>No se pudieron cargar los datos del dashboard.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
          <button
            className="btn btn-secondary mt-2"
            onClick={() => {
              // Forzar datos de respaldo
              const fallbackData = getFallbackData(selectedYear);
              setDashboardData(fallbackData);
              setModules(fallbackData.modules);
              setFilteredModules(fallbackData.modules);
            }}
          >
            Usar datos de demostración
          </button>
        </div>
      </div>
    );
  }

  // Ahora sí podemos desestructurar con seguridad
  const {
    modules: loadedModules,
    nextModules = [],
    recentModules = [],
    stats = {},
    yearTitle = selectedYear === 1 ? 'Primero de Bachillerato' : 'Segundo de Bachillerato',
    canDownloadCertificate = false,
    progressPercent = 0
  } = dashboardData;

  // Validar que los arrays y objetos existan
  const safeModules = loadedModules || [];
  const safeNextModules = nextModules || [];
  const safeRecentModules = recentModules || [];
  const safeStats = stats || {
    total: 0,
    completed: 0,
    approved: 0,
    inProgress: 0,
    notStarted: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0
  };

  return (
    <div className="dashboard-fullscreen">
      <div className="dashboard-container">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {sidebarActive ? '✕' : '☰'}
        </button>

        <div className="dashboard">
          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
            <div
              className="profile"
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            >
              <img
                id="sidebarPhoto"
                src={userData?.fotoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Perfil"
              />
              <h3 id="name">{userData?.nombre || 'Estudiante'}</h3>
              <small>✏️ Editar perfil</small>
            </div>

            <nav className="menu">
              <button
                className={activeSection === 'inicio' ? 'active' : ''}
                onClick={() => handleSectionChange('inicio')}
              >
                🏠 Inicio
              </button>
              <button
                className={activeSection === 'modulos' ? 'active' : ''}
                onClick={() => handleSectionChange('modulos')}
              >
                📘 Módulos
              </button>
              <button
                className={activeSection === 'progreso' ? 'active' : ''}
                onClick={() => handleSectionChange('progreso')}
              >
                📊 Progreso
              </button>
              <button
                className={activeSection === 'certificado' ? 'active' : ''}
                onClick={() => handleSectionChange('certificado')}
              >
                🎓 Certificado
              </button>
              <button onClick={handleLogout}>
                🚪 Cerrar sesión
              </button>
            </nav>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className={`content ${!sidebarActive ? 'full-width' : ''}`}>
            {/* SECCIÓN INICIO */}
            <section id="inicio" className={`section ${activeSection === 'inicio' ? 'active' : ''}`}>
              <div className="card">
                <div className="modules-header">
                  <h2>👋 Bienvenido, <span id="userName">{userData?.nombre || 'Estudiante'}</span></h2>
                  <p style={{ color: 'var(--muted)' }}>
                    {yearTitle} - Tu progreso general del curso
                  </p>
                </div>

                <div className="stats-container">
                  <div className="stat-card completed">
                    <div className="icon">✅</div>
                    <div className="number" id="completedCountHome">{safeStats.approved || 0}</div>
                    <div className="label">Completados</div>
                  </div>

                  <div className="stat-card pending">
                    <div className="icon">⏳</div>
                    <div className="number" id="inProgressCountHome">{safeStats.inProgress || 0}</div>
                    <div className="label">En Progreso</div>
                  </div>

                  <div className="stat-card total">
                    <div className="icon">📚</div>
                    <div className="number" id="totalCountHome">{safeStats.total || 0}</div>
                    <div className="label">Total Módulos</div>
                  </div>

                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
                    <div className="icon">📈</div>
                    <div className="number" id="progressPercentHome">{((safeStats.approved / safeStats.total) * 100).toFixed(2)}%</div>
                    <div className="label">Progreso Total</div>
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>📊 Progreso por Módulos</h3>
                    <ProgressChart
                      completed={safeStats.approved || 0}
                      inProgress={safeStats.inProgress || 0}
                      notStarted={safeStats.notStarted || 0}
                    />
                  </div>

                  <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>🎯 Próximos en Continuar</h3>
                    <div id="nextModules" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {safeNextModules.length > 0 ? (
                        safeNextModules.map(module => (
                          <div key={module.id} className="timeline-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="module-icon" style={{
                                background: module.status === 'in-progress' ? '#fef3c7' : '#f3f4f6',
                                color: module.status === 'in-progress' ? '#92400e' : '#6b7280',
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px'
                              }}>
                                {module.icon}
                              </span>
                              <div>
                                <strong>{module.title}</strong>
                                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                  {module.difficulty} • {module.duration}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                          {safeStats.completed === safeStats.total
                            ? '¡Felicidades! Has completado todos los módulos.'
                            : 'No hay módulos próximos disponibles.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '30px' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>🕐 Módulos Recientes</h3>
                  <div className="modules-grid" id="recentModules">
                    {safeRecentModules.length > 0 ? (
                      safeRecentModules.map(module => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          onClick={() => handleModuleClick(module)}
                        />
                      ))
                    ) : (
                      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px', width: '100%' }}>
                        No hay actividad reciente. ¡Comienza tu primer módulo!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* SECCIÓN MÓDULOS */}
            <section id="modulos" className={`section ${activeSection === 'modulos' ? 'active' : ''}`}>
              <div className="card">
                <div className="modules-header">
                  <div>
                    <h3>📚 Módulos Educativos - {yearTitle}</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '5px' }}>Gestiona tu aprendizaje</p>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    <span id="totalModules">{safeStats.total || 0} módulos</span> •
                    <span id="completedModules"> {safeStats.completed || 0} completados</span>
                    {safeStats.approved > 0 && (
                      <span> • {safeStats.approved} aprobados</span>
                    )}
                  </div>
                </div>

                <div className="stats-container">
                  <div className="stat-card completed">
                    <div className="label">Completados</div>
                    <div className="number" id="completedCount">{safeStats.approved + safeStats.inProgress || 0}</div>
                  </div>
                  <div className="stat-card pending">
                    <div className="label">En progreso</div>
                    <div className="number" id="progressCount">{safeStats.inProgress || 0}</div>
                  </div>
                  <div className="stat-card total">
                    <div className="label">Total</div>
                    <div className="number" id="totalCount">{safeStats.total || 0}</div>
                  </div>
                  {safeStats.approved > 0 && (
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                      <div className="label">Aprobados</div>
                      <div className="number" id="approvedCount">{safeStats.approved || 0}</div>
                    </div>
                  )}
                </div>

                <div className="search-filter">
                  <input
                    type="text"
                    className="search-box"
                    placeholder="🔍 Buscar módulos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completados</option>
                    <option value="in-progress">En progreso</option>
                    <option value="not-started">No iniciados</option>
                  </select>
                </div>

                <div className="modules-grid" id="modules">
                  {filteredModules.length > 0 ? (
                    filteredModules.map(module => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onClick={() => handleModuleClick(module)}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <i>📭</i>
                      <h3>No se encontraron módulos</h3>
                      <p>Intenta con otros términos de búsqueda</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECCIÓN PROGRESO */}
            <section id="progreso" className={`section ${activeSection === 'progreso' ? 'active' : ''}`}>
              <div className="card">
                <h3>📊 Progreso de Aprendizaje</h3>
                <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                  Seguimiento del avance conforme completas cada módulo
                </p>

                <div className="progress-grid">
                  <div>
                    <h4>📈 Progreso acumulado</h4>
                    <div className="progress-chart-container">
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: 'var(--bg)',
                        borderRadius: '10px'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                        <p>Progreso: {progressPercent}%</p>
                        <small className="text-muted">
                          {safeStats.completed} de {safeStats.total} módulos completados
                        </small>
                        {safeStats.approved > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <small className="text-success">
                              ✅ {safeStats.approved} módulos aprobados
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4>✅ Módulos completados</h4>
                    <ul id="timeline" style={{ listStyle: 'none', padding: 0 }}>
                      {safeModules
                        .filter(m => m.status === 'completed')
                        .map(module => (
                          <li key={module.id} className="timeline-item">
                            <strong>{module.title}</strong>
                            <small style={{ display: 'block', color: 'var(--muted)' }}>
                              Completado al 100%
                              {safeStats.approved > 0 && ' • ✅ Aprobado'}
                            </small>
                          </li>
                        ))}
                      {safeModules.filter(m => m.status === 'completed').length === 0 && (
                        <li style={{ color: 'var(--muted)', padding: '10px' }}>
                          No hay módulos completados todavía.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <p id="progressText" style={{ marginTop: '20px', fontWeight: 600 }}>
                  {progressPercent === 100
                    ? '🎉 ¡Felicidades! Has completado todos los módulos.'
                    : `Progreso general: ${progressPercent}% completado`}
                  {safeStats.approved > 0 && (
                    <span style={{ color: '#10b981', marginLeft: '10px' }}>
                      ({safeStats.approved} aprobados)
                    </span>
                  )}
                </p>
              </div>
            </section>

            {/* SECCIÓN CERTIFICADO */}
            <section id="certificado" className={`section ${activeSection === 'certificado' ? 'active' : ''}`}>
              <div className="card">
                <h3>🎓 Certificado de Finalización</h3>
                <p id="certText">
                  {canDownloadCertificate
                    ? '✅ ¡Felicidades! Has completado todos los módulos. Ya puedes descargar tu certificado.'
                    : '🔒 Completa todos los módulos para desbloquear tu certificado'}
                </p>

                <div className="preview-controls">
                  <button
                    id="btnCert"
                    className={`btn ${canDownloadCertificate ? 'btn-primary' : 'btn-disabled'}`}
                    disabled={!canDownloadCertificate}
                    style={{ marginBottom: '20px' }}
                  >
                    📄 Descargar Certificado en PDF
                  </button>

                  <div className="preview-options">
                    <select id="themeSelect" className="filter-select">
                      <option value="default">Tema: Clásico</option>
                      <option value="modern">Tema: Moderno</option>
                      <option value="elegant">Tema: Elegante</option>
                    </select>

                    <button className="btn btn-secondary">
                      🔄 Actualizar vista previa
                    </button>
                  </div>
                </div>

                {canDownloadCertificate ? (
                  <div id="certPreview">
                    <div className="preview-header">
                      <h4>👁️ Vista Previa del Certificado</h4>
                      <p>Así se verá tu certificado cuando lo descargues</p>
                    </div>

                    <div id="certPreviewContainer" className="cert-preview-container">
                      <div className="cert-border">
                        <h1>Certificado de Finalización</h1>
                        <div className="cert-subtitle">Sys Scholar Platform</div>
                        <h2>{yearTitle}</h2>
                        <div className="cert-body">
                          Se otorga el presente certificado a
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '20px 0', color: 'var(--primary-dark)' }}>
                          {userData?.nombre || 'Estudiante'}
                        </div>
                        <div className="cert-body">
                          por haber completado exitosamente el curso de<br />
                          <strong>{yearTitle}</strong><br />
                          con un promedio de <strong>{safeStats.averageScore || 0}%</strong>.
                        </div>
                        <div className="cert-message">
                          Este certificado acredita la finalización de {safeStats.completed} módulos
                          y demuestra competencia en las habilidades adquiridas durante el curso.
                        </div>
                        <div className="cert-footer">
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Fecha de emisión</div>
                            <div>{new Date().toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Código de verificación</div>
                            <div>SS-{userData?.uid?.slice(0, 8) || '12345678'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="preview-footer">
                      <p><small>📏 Dimensiones: A4 horizontal (297mm × 210mm)</small></p>
                      <p><small>🎨 Personalizable antes de descargar</small></p>
                    </div>
                  </div>
                ) : (
                  <div id="certLocked" className="cert-locked">
                    <div className="lock-icon">🔒</div>
                    <h4>Certificado bloqueado</h4>
                    <p>Completa todos los módulos para desbloquear tu certificado personalizado</p>
                    <div className="progress-indicator">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          id="certProgressBar"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span id="certProgressText">
                        {progressPercent}% completado ({safeStats.completed}/{safeStats.total} módulos)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;