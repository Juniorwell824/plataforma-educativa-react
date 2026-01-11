import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import { saveTestResult } from '../../services/dashboardService';
import { saveRetakeTestResult } from '../../services/testRetakeService';
import '../../styles/HTMLModuleViewer.css';

const HTMLModuleViewer = () => {
  const { filename } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [moduleData, setModuleData] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);

  // Procesar datos recibidos
  useEffect(() => {
    if (location.state) {
      console.log('📋 Datos recibidos:', location.state);

      // Asegurar que tenemos todos los datos necesarios
      const moduleNumber = location.state.moduleNumber ||
        location.state.testId ||
        location.state.order ||
        1;

      const moduleTitle = location.state.moduleTitle ||
        getModuleTitle(moduleNumber);

      // ¡SIEMPRE forzar modo interactivo!
      const processedData = {
        ...location.state,
        isViewOnly: false,
        canTakeTest: true,
        canRetake: true,
        moduleNumber: location.state.testId || location.state.order || 1,
        moduleTitle: location.state.moduleTitle || `Módulo ${location.state.testId || location.state.order || 1}`,
        year: location.state.year || 1,
        isRetake: location.state.estado === 'aprobado' || location.state.estado === 'reprobado',
        previousScore: location.state.testInfo?.porcentaje || 0
      };

      setModuleData(processedData);
      console.log('✅ Módulo en modo INTERACTIVO forzado:', processedData);
    }
  }, [location.state]);

  // Función auxiliar para obtener título
  const getModuleTitle = (moduleNumber) => {
    const titles = {
      1: 'Introducción a la Informática',
      2: 'Soporte Técnico',
      3: 'Sistema Operativo',
      4: 'Ofimática Básica',
      5: 'Internet Seguro',
      6: 'Programación Básica'
    };
    return titles[moduleNumber] || `Módulo ${moduleNumber}`;
  };

  // Cargar HTML
  useEffect(() => {
    const loadHTML = async () => {
      if (!filename) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/Modulos/${filename}`);

        if (!response.ok) throw new Error('Error cargando módulo');

        const html = await response.text();

        // Modificar HTML para modo interactivo
        const modifiedHTML = modifyHTMLForTest(html);
        setHtmlContent(modifiedHTML);
        setLoading(false);

      } catch (error) {
        console.error('❌ Error:', error);
        Swal.fire('Error', 'No se pudo cargar el módulo', 'error').then(() => {
          navigate('/dashboard');
        });
      }
    };

    loadHTML();
  }, [filename, navigate, moduleData]);

  // Función para modificar el HTML - SIEMPRE modo prueba
  const modifyHTMLForTest = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const moduleNumber = moduleData?.moduleNumber || 1;
    const totalQuestions = moduleNumber === 6 ? 6 : 5;
    const moduleTitle = moduleData?.moduleTitle || 'Test';

    // Agregar banner de reintento si es necesario
    if (moduleData?.isRetake) {
      const banner = document.createElement('div');
      banner.style.cssText = `
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        font-weight: bold;
      `;
      banner.innerHTML = `🔄 REINTENTO DEL TEST - Módulo ${moduleNumber}`;

      const firstCard = tempDiv.querySelector('.card');
      if (firstCard) {
        firstCard.insertBefore(banner, firstCard.firstChild);
      }
    }

    // Modificar función evaluar
    const scripts = tempDiv.getElementsByTagName('script');

    for (let script of scripts) {
      if (script.textContent.includes('evaluar()')) {
        const newScript = `
          function evaluar() {
            let score = 0;
            let answers = [];
            
            for (let i = 1; i <= ${totalQuestions}; i++) {
              const selected = document.querySelector('input[name="q' + i + '"]:checked');
              const isCorrect = selected ? parseInt(selected.value) === 1 : false;
              if (isCorrect) score++;
              answers.push({
                question: i,
                answer: selected ? parseInt(selected.value) : null,
                correct: isCorrect
              });
            }
            
            const percentage = Math.round((score / ${totalQuestions}) * 100);
            const passed = percentage >= 70;
            
            // Mostrar resultados
            const resultDiv = document.getElementById('resultado') || document.body;
            const resultHTML = '<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">' +
              '<h3>' + (passed ? '✅ APROBADO' : '❌ REPROBADO') + '</h3>' +
              '<p>Puntaje: <strong>' + score + '/' + ${totalQuestions} + '</strong> (' + percentage + '%)</p>' +
              '<p>Módulo: ${moduleTitle}</p>' +
              '<button id="saveResultBtn" style="' +
                'background: #30297A;' +
                'color: white;' +
                'padding: 10px 20px;' +
                'border: none;' +
                'border-radius: 5px;' +
                'cursor: pointer;' +
                'margin-top: 10px;' +
              '">' +
                '💾 Guardar Resultado' +
              '</button>' +
              '<button id="reviewBtn" style="' +
                'background: #6c757d;' +
                'color: white;' +
                'padding: 10px 20px;' +
                'border: none;' +
                'border-radius: 5px;' +
                'cursor: pointer;' +
                'margin-left: 10px;' +
                'margin-top: 10px;' +
              '">' +
                '🔍 Revisar Respuestas' +
              '</button>' +
            '</div>';
            
            resultDiv.innerHTML += resultHTML;
            
            // Guardar resultado
            document.getElementById('saveResultBtn').onclick = function() {
              if (window.saveTest) {
                window.saveTest(score, ${totalQuestions}, answers, percentage, passed);
              } else {
                alert('Función de guardado no disponible. Recarga la página.');
              }
            };
            
            // Revisar respuestas
            document.getElementById('reviewBtn').onclick = function() {
              answers.forEach(function(ans) {
                const questionDiv = document.querySelector('#q' + ans.question);
                if (questionDiv) {
                  const inputs = questionDiv.querySelectorAll('input[type="radio"]');
                  inputs.forEach(function(input) {
                    input.disabled = true;
                    if (input.value == ans.answer) {
                      input.parentElement.style.backgroundColor = ans.correct ? '#d4edda' : '#f8d7da';
                      input.parentElement.style.border = ans.correct ? '2px solid #28a745' : '2px solid #dc3545';
                    }
                  });
                }
              });
            };
          }
        `;

        script.textContent = newScript;
      }
    }

    // Agregar botón de regreso
    const backBtn = document.createElement('button');
    backBtn.innerHTML = '← Volver al Dashboard';
    backBtn.style.cssText = `
      background: #30297A;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px 0;
      font-weight: bold;
    `;
    backBtn.onclick = () => navigate('/dashboard');

    const firstCard = tempDiv.querySelector('.card');
    if (firstCard) {
      firstCard.insertBefore(backBtn, firstCard.firstChild);
    }

    return tempDiv.innerHTML;
  };

  // Función para guardar resultados
  const saveTestResults = async (score, total, answers, percentage, passed) => {
    try {
      if (!currentUser?.uid || !moduleData) {
        throw new Error('Usuario no autenticado');
      }

      const testData = {
        moduleTitle: moduleData.moduleTitle,
        totalPreguntas: total,
        puntajeObtenido: score,
        porcentaje: percentage,
        aprobado: passed,
        respuestas: answers,
        fechaCompletado: new Date().toISOString()
      };

      // Determinar si es reintento
      const isRetake = moduleData.isRetake || moduleData.previousScore > 0;

      let result;
      if (isRetake) {
        result = await saveRetakeTestResult(
          currentUser.uid,
          moduleData.year || 1,
          moduleData.moduleNumber.toString(),
          testData,
          true
        );
      } else {
        result = await saveTestResult(
          currentUser.uid,
          moduleData.year || 1,
          moduleData.moduleNumber.toString(),
          testData
        );
      }

      if (result.success) {
        setTestCompleted(true);

        Swal.fire({
          icon: passed ? 'success' : 'info',
          title: isRetake ? 'Reintento Completado' : 'Test Completado',
          html: `<div style="text-align: left;">
            <p><strong>Módulo:</strong> ${moduleData.moduleTitle}</p>
            <p><strong>Puntaje:</strong> ${score}/${total} (${percentage}%)</p>
            <p><strong>Estado:</strong> ${passed ? '✅ APROBADO' : '❌ REPROBADO'}</p>
            ${isRetake ? '<p><strong>Es un reintento</strong></p>' : ''}
          </div>`,
          confirmButtonText: 'Volver al Dashboard',
          showCancelButton: !passed,
          cancelButtonText: 'Intentar de nuevo'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/dashboard', { state: { refresh: true } });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Recargar para nuevo intento
            window.location.reload();
          }
        });
      }

    } catch (error) {
      console.error('❌ Error guardando:', error);
      Swal.fire('Error', 'No se pudo guardar el resultado', 'error');
    }
  };

  // Exponer función global
  useEffect(() => {
    window.saveTest = saveTestResults;

    return () => {
      window.saveTest = null;
    };
  }, [moduleData, currentUser]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner"></div>
        <p>Cargando módulo...</p>
      </div>
    );
  }

  return (
    <div className="html-module-viewer">
      <div className="module-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Volver al Dashboard
        </button>

        {moduleData && (
          <div style={{ marginTop: '20px' }}>
            <h1>{moduleData.moduleTitle}</h1>
            <p>Año {moduleData.year} • Módulo {moduleData.moduleNumber}</p>
            {moduleData.isRetake && (
              <div style={{
                background: '#fef3c7',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px'
              }}>
                <strong>🔄 REINTENTO</strong> - Puedes mejorar tu puntaje anterior: {moduleData.previousScore}%
              </div>
            )}
          </div>
        )}
      </div>

      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {testCompleted && (
        <div style={{
          background: '#d1fae5',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <p>✅ Test completado. Los resultados se han guardado.</p>
          <button onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default HTMLModuleViewer;