// src/components/student/TestResults.jsx
import React from 'react';
import '../../styles/TestResults.css';

const TestResults = ({ results, onRetry, onContinue }) => {
  const { correct, total, percentage, approved, details } = results;
  
  return (
    <div className="test-results-container">
      <div className={`result-header ${approved ? 'approved' : 'failed'}`}>
        <div className="result-icon">
          {approved ? '✅' : '❌'}
        </div>
        <h2>{approved ? '¡Felicidades!' : 'Necesitas mejorar'}</h2>
        <p>{approved ? 'Has aprobado el test' : 'No has alcanzado el puntaje mínimo'}</p>
      </div>
      
      <div className="result-stats">
        <div className="stat-card">
          <div className="stat-value">{correct}/{total}</div>
          <div className="stat-label">Respuestas correctas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{percentage}%</div>
          <div className="stat-label">Porcentaje</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {approved ? 'APROBADO' : 'REPROBADO'}
          </div>
          <div className="stat-label">Estado</div>
        </div>
      </div>
      
      <div className="result-details">
        <h3>Detalle de respuestas:</h3>
        <div className="answers-list">
          {details.map((detail, index) => (
            <div key={index} className={`answer-item ${detail.isCorrect ? 'correct' : 'incorrect'}`}>
              <span className="question-number">Pregunta {detail.question}:</span>
              <span className="answer-status">
                {detail.isCorrect ? '✅ Correcta' : '❌ Incorrecta'}
              </span>
              <div className="answer-comparison">
                <small>Tu respuesta: <strong>Opción {detail.userAnswer || 'No respondida'}</strong></small>
                {!detail.isCorrect && (
                  <small>Respuesta correcta: <strong>Opción {detail.correctAnswer}</strong></small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="result-actions">
        {!approved && (
          <button className="btn btn-retry" onClick={onRetry}>
            🔄 Reintentar test
          </button>
        )}
        <button className="btn btn-continue" onClick={onContinue}>
          {approved ? 'Continuar con el siguiente módulo' : 'Regresar al dashboard'}
        </button>
      </div>
    </div>
  );
};

export default TestResults;