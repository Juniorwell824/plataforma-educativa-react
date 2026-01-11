import React from 'react';

const ProgressChart = ({ completed, inProgress, notStarted }) => {
  const total = completed + inProgress + notStarted;
  const completedPercent = total > 0 ? (completed / total) * 100 : 0;
  const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const notStartedPercent = total > 0 ? (notStarted / total) * 100 : 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
        {/* Gráfico circular simplificado */}
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Completados */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke="#16a34a"
            strokeWidth="20"
            strokeDasharray={`${completedPercent * 5.65} 565`}
            strokeDashoffset="0"
            transform="rotate(-90 100 100)"
          />
          {/* En progreso */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="20"
            strokeDasharray={`${inProgressPercent * 5.65} 565`}
            strokeDashoffset={`${-completedPercent * 5.65}`}
            transform="rotate(-90 100 100)"
          />
          {/* No iniciados */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeDasharray={`${notStartedPercent * 5.65} 565`}
            strokeDashoffset={`${-(completedPercent + inProgressPercent) * 5.65}`}
            transform="rotate(-90 100 100)"
          />
        </svg>
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)' }}>
            {Math.round(completedPercent)}%
          </div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Completado
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginTop: '20px',
        fontSize: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
          <span>Completados ({completed})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
          <span>En progreso ({inProgress})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '50%' }}></div>
          <span>No iniciados ({notStarted})</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;