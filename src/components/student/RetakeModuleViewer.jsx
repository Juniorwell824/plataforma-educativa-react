// src/components/student/RetakeModuleViewer.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../../styles/RetakeModuleViewer.css';

const RetakeModuleViewer = ({ moduleData, onStartRetake, onViewResults }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartRetake = () => {
    Swal.fire({
      title: '¿Realizar nuevo intento?',
      html: `
        <div style="text-align: left;">
          <p><strong>Módulo:</strong> ${moduleData.moduleTitle}</p>
          <p><strong>Puntaje actual:</strong> ${moduleData.testInfo?.porcentaje || 0}%</p>
          <p><strong>Estado:</strong> ${moduleData.testInfo?.aprobado ? '✅ Aprobado' : '❌ Reprobado'}</p>
          <p><strong>Último intento:</strong> ${moduleData.testInfo?.fecha ? 
            new Date(moduleData.testInfo.fecha._seconds * 1000).toLocaleDateString('es-ES') : 
            'No disponible'}</p>
          <hr>
          <p><small>Tu nuevo puntaje reemplazará el anterior en tu historial.</small></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, comenzar nuevo intento',
      cancelButtonText: 'Ver resultados actuales',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        onStartRetake();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        onViewResults();
      }
    });
  };

  return (
    <div className="retake-module-viewer">
      <div className="retake-header">
        <h2>🔄 {moduleData.moduleTitle}</h2>
        <p className="module-subtitle">
          Año {moduleData.year} • Módulo {moduleData.moduleNumber}
        </p>
      </div>

      <div className="retake-card">
        <div className="current-results">
          <h3>📊 Resultados Actuales</h3>
          <div className="results-grid">
            <div className="result-item">
              <div className="result-label">Puntaje</div>
              <div className="result-value">
                {moduleData.testInfo?.puntajeObtenido || 0}/{moduleData.testInfo?.totalPreguntas || 5}
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">Porcentaje</div>
              <div className="result-value percentage">
                {moduleData.testInfo?.porcentaje || 0}%
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">Estado</div>
              <div className={`result-value status ${moduleData.testInfo?.aprobado ? 'approved' : 'failed'}`}>
                {moduleData.testInfo?.aprobado ? '✅ Aprobado' : '❌ Reprobado'}
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">Último intento</div>
              <div className="result-value date">
                {moduleData.testInfo?.fecha ? 
                  new Date(moduleData.testInfo.fecha._seconds * 1000).toLocaleDateString('es-ES') : 
                  'No disponible'}
              </div>
            </div>
          </div>
        </div>

        <div className="retake-options">
          <h3>🎯 Opciones Disponibles</h3>
          
          <div className="options-grid">
            <button className="option-card" onClick={handleStartRetake}>
              <div className="option-icon">🔄</div>
              <div className="option-content">
                <h4>Realizar Nuevo Intento</h4>
                <p>Comienza un nuevo intento del test. Tu nuevo puntaje reemplazará el anterior.</p>
                <small>Recomendado si deseas mejorar tu calificación.</small>
              </div>
            </button>

            <button className="option-card" onClick={onViewResults}>
              <div className="option-icon">📊</div>
              <div className="option-content">
                <h4>Ver Resultados Detallados</h4>
                <p>Revisa tus respuestas anteriores y el análisis detallado del test.</p>
                <small>Útil para estudiar tus errores.</small>
              </div>
            </button>

            <button className="option-card" onClick={() => window.location.reload()}>
              <div className="option-icon">📚</div>
              <div className="option-content">
                <h4>Repasar Contenido</h4>
                <p>Vuelve a estudiar el material del módulo antes de intentar nuevamente.</p>
                <small>Prepara mejor tu próximo intento.</small>
              </div>
            </button>
          </div>
        </div>

        <div className="retake-info">
          <h4>ℹ️ Información Importante</h4>
          <ul>
            <li>Puedes realizar hasta <strong>3 intentos</strong> por módulo.</li>
            <li>Solo se considerará tu <strong>mejor puntaje</strong> para el certificado.</li>
            <li>Tu nuevo intento <strong>reemplazará</strong> el puntaje anterior.</li>
            <li>El historial de intentos se conserva para tu revisión.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RetakeModuleViewer;