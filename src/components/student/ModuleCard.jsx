// src/components/student/ModuleCard.jsx - VERSIÓN MEJORADA
import React from 'react';
import '../../styles/ModuleCard.css';
import { enforceInteractiveMode } from '../../utils/testModeEnforcer';

const ModuleCard = ({ module, onClick }) => {
  // Determinar qué mostrar según el estado
  const isCompleted = module.estado === 'aprobado' || module.estado === 'reprobado';
  const isInProgress = module.estado === 'en-progreso';
  const isPending = module.estado === 'pendiente';
  const isApproved = module.estado === 'aprobado';
  const isFailed = module.estado === 'reprobado';

  // Texto del botón
  const getButtonText = () => {
    if (isApproved) return '✅ Ver Resultados';
    if (isFailed) return '🔄 Retomar Test';
    if (isInProgress) return '⏳ Continuar';
    return '🚀 Comenzar Test';
  };

  // Color del botón según estado
  const getButtonClass = () => {
    if (isApproved) return 'module-button approved';
    if (isFailed) return 'module-button retake';
    if (isInProgress) return 'module-button in-progress';
    return 'module-button pending';
  };

  // Formatear fecha si existe
  const formatDate = (timestamp) => {
    if (!timestamp) return '';

    try {
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleDateString('es-ES');
      }
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString('es-ES');
      }
      return '';
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  };

  // En ModuleCard.jsx, en la función handleClick:
  // En handleClick, incluye el número:
  // Manejar clic en el módulo
  // En ModuleCard.jsx, actualiza la función handleClick:
  const handleClick = () => {

    const interactiveModuleData = enforceInteractiveMode(module);
    console.log('🔄 ModuleCard - Modo interactivo forzado:', interactiveModuleData);
    // Determinar si está aprobado pero puede retomar
    const isApproved = module.estado === 'aprobado';
    const canRetakeApproved = true; // Permitir retomar incluso si está aprobado

    // Pasar información adicional según el estado
    const moduleData = {
      ...module,
      isCompleted: isCompleted || isInProgress,
      isViewOnly: false, // ¡SIEMPRE permitir interactuar!
      canTakeTest: true, // ¡SIEMPRE permitir tomar test!
      canRetake: isFailed || (isApproved && canRetakeApproved), // Permitir retomar si reprobado O aprobado
      isRetake: isFailed || isApproved, // Indica si es un retomo
      showRetakeOption: true, // Nueva bandera para mostrar opción de retomar
      numeroModulo: module.numeroModulo || module.order || 1,
      order: module.order || 1,
      estado: module.estado || 'pendiente'
    };

    console.log('🔄 ModuleCard - Estado:', {
      title: module.title,
      estado: module.estado,
      isApproved,
      isFailed,
      canRetake: moduleData.canRetake,
      isRetake: moduleData.isRetake
    });

    onClick(moduleData);
  };

  const getModuleNumber = () => {
    // Intentar extraer número del ID
    const match = module.id?.match(/(\d+ro|2do)_modulo_(\d+)/i) ||
      module.id?.match(/modulo_(\d+)/i);

    if (match) {
      return parseInt(match[2] || match[1]) || module.order || 1;
    }

    return module.order || module.numeroModulo || 1;
  };


  return (
    <div className={`module-card ${module.estado}`} onClick={handleClick}>
      <div className="module-card-header">
        <div className="module-icon">{module.icon || '📚'}</div>
        <div className="module-title-section">
          <h4 className="module-title">{module.title}</h4>
          <span className="status-badge" style={{ backgroundColor: module.colorEtiqueta }}>
            {module.etiqueta}
            {isCompleted && module.testInfo?.porcentaje > 0 && (
              <span className="percentage-badge"> ({module.testInfo.porcentaje}%)</span>
            )}
          </span>
        </div>
      </div>

      <p className="module-description">{module.description}</p>

      <div className="module-meta">
        <span className="meta-item">
          <span className="meta-icon">📊</span>
          {module.difficulty}
        </span>
        <span className="meta-item">
          <span className="meta-icon">⏱️</span>
          {module.duration}
        </span>
        {module.porcentaje > 0 && (
          <span className="meta-item">
            <span className="meta-icon">📈</span>
            {module.porcentaje}%
          </span>
        )}
        {isCompleted && module.testInfo?.fecha && (
          <span className="meta-item">
            <span className="meta-icon">📅</span>
            {formatDate(module.testInfo.fecha)}
          </span>
        )}
      </div>

      {/* Mostrar diferente contenido según estado */}
      {isCompleted ? (
        // MÓDULOS COMPLETADOS: Mostrar info y opción de retomar
        <div className="completed-info">
          <div className="completion-badge">
            <span className="check-icon">{isApproved ? '✅' : '🔄'}</span>
            <span className="completion-text">
              {isApproved ? 'Aprobado' : 'Reprobado'} - {module.testInfo?.porcentaje || 0}%
            </span>
          </div>

          {module.testInfo && (
            <div className="test-details">
              <div className="test-score">
                <span className="score-label">Puntaje:</span>
                <span className="score-value">
                  {module.testInfo.puntajeObtenido || 0}/{module.testInfo.totalPreguntas || 5}
                </span>
              </div>
              {module.testInfo.fecha && (
                <div className="test-date">
                  <span className="date-label">Último intento:</span>
                  <span className="date-value">{formatDate(module.testInfo.fecha)}</span>
                </div>
              )}
              {isFailed && (
                <div className="retake-notice">
                  <small>⚠️ Puedes retomar este test para mejorar tu calificación</small>
                </div>
              )}
              {isApproved && (
                <div className="retake-notice">
                  <small>🔄 Puedes volver a realizar el test si lo deseas</small>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // MÓDULOS EN PROGRESO o PENDIENTES: Con barra de progreso
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${module.progress}%`,
                backgroundColor: module.colorEtiqueta
              }}
            ></div>
          </div>
          <span className="progress-text">
            {module.progress}% completado
            {isPending && ' • Listo para comenzar'}
          </span>
        </div>
      )}

      <button className={getButtonClass()}>
        {getButtonText()}
        {isFailed && ' (Intento nuevo)'}
        {isApproved && ' (Ver/Retomar)'}
      </button>
    </div>
  );
};

export default ModuleCard;