// src/components/student/TestTaker.jsx
import React, { useState, useEffect } from 'react';
import { gradeTest } from '../../services/testGradingService';
import TestResults from './TestResults';
import '../../styles/TestTaker.css';

const TestTaker = ({ moduleData, userId, year, onTestComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos en segundos
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  const questions = moduleData.preguntas || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];
  
  // Temporizador
  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, showResults]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerSelect = (optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion + 1]: optionIndex
    });
  };
  
  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (window.confirm('¿Estás seguro de enviar el test? No podrás modificarlo después.')) {
      setIsSubmitting(true);
      
      try {
        const result = await gradeTest(
          userId,
          year,
          moduleData.order || moduleData.id.match(/\d+/)[0],
          userAnswers,
          {
            questions: questions,
            puntajeMinimo: moduleData.puntajeMinimo || 70,
            moduleTitle: moduleData.title
          }
        );
        
        if (result.success) {
          setTestResults({
            correct: result.data.puntajeObtenido,
            total: result.data.totalPreguntas,
            percentage: result.data.porcentaje,
            approved: result.data.aprobado,
            details: result.data.resultadosDetallados || []
          });
          setShowResults(true);
          
          // Notificar al componente padre
          if (onTestComplete) {
            onTestComplete(result.data);
          }
        } else {
          alert('Error al guardar resultados: ' + result.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el test');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;
  
  if (showResults && testResults) {
    return (
      <TestResults
        results={testResults}
        onRetry={() => {
          setShowResults(false);
          setCurrentQuestion(0);
          setUserAnswers({});
          setTimeLeft(1800);
        }}
        onContinue={() => onTestComplete && onTestComplete(testResults)}
      />
    );
  }
  
  return (
    <div className="test-taker-container">
      <div className="test-header">
        <h3>{moduleData.title} - Test de evaluación</h3>
        <div className="test-meta">
          <span className="timer">⏱️ {formatTime(timeLeft)}</span>
          <span className="question-counter">
            Pregunta {currentQuestion + 1} de {totalQuestions}
          </span>
          <span className="difficulty">Dificultad: {moduleData.dificultad}</span>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="question-container">
        <div className="question-header">
          <h4>Pregunta {currentQuestion + 1}:</h4>
          <small>Selecciona una respuesta</small>
        </div>
        
        <div className="question-text">
          <p>{currentQ?.pregunta}</p>
        </div>
        
        <div className="options-container">
          {currentQ?.opciones?.map((option, index) => (
            <div 
              key={index}
              className={`option-card ${
                userAnswers[currentQuestion + 1] === index ? 'selected' : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <div className="option-letter">
                {String.fromCharCode(65 + index)}.
              </div>
              <div className="option-text">{option}</div>
              {userAnswers[currentQuestion + 1] === index && (
                <div className="option-check">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button 
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          ← Anterior
        </button>
        
        <div className="answer-status">
          {userAnswers[currentQuestion + 1] !== undefined 
            ? `✅ Respondida (Opción ${String.fromCharCode(65 + userAnswers[currentQuestion + 1])})`
            : '❌ Sin responder'}
        </div>
        
        {currentQuestion < totalQuestions - 1 ? (
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Siguiente →
          </button>
        ) : (
          <button 
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(userAnswers).length < totalQuestions}
          >
            {isSubmitting ? 'Enviando...' : '📤 Enviar Test'}
          </button>
        )}
      </div>
      
      <div className="question-indicators">
        {questions.map((_, index) => (
          <div 
            key={index}
            className={`indicator ${index === currentQuestion ? 'current' : ''} ${
              userAnswers[index + 1] !== undefined ? 'answered' : 'unanswered'
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestTaker;