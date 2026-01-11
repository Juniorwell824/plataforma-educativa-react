// src/services/testGradingService.js
import { saveTestResult } from './dashboardService';

/**
 * Califica un test comparando respuestas del usuario con las correctas
 */
export const gradeTest = async (userId, year, testId, userAnswers, testData) => {
  try {
    console.log(`📝 Calificando test ${testId} para usuario ${userId}`);
    
    // 1. Obtener las preguntas y respuestas correctas
    const questions = testData.questions || [];
    const totalQuestions = questions.length;
    
    // 2. Calificar cada pregunta
    const resultadosDetallados = [];
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      const questionNumber = index + 1;
      const userAnswer = userAnswers[questionNumber];
      const correctAnswer = question.respuestaCorrecta;
      const isCorrect = userAnswer == correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      resultadosDetallados.push({
        questionId: questionNumber,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        points: isCorrect ? question.puntos || 1 : 0,
        questionText: question.pregunta
      });
    });
    
    // 3. Calcular porcentaje y determinar si aprobó
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const approved = percentage >= testData.puntajeMinimo || 70; // Usar puntaje mínimo del módulo o 70% por defecto
    
    // 4. Preparar datos para guardar
    const testResult = {
      userId: userId,
      year: year,
      testId: testId,
      moduleId: `modulo${testId}`,
      moduleTitle: testData.moduleTitle || `Módulo ${testId}`,
      totalPreguntas: totalQuestions,
      respuestas: userAnswers,
      puntajeObtenido: correctAnswers,
      puntajeMaximo: totalQuestions,
      porcentaje: percentage,
      aprobado: approved,
      resultadosDetallados: resultadosDetallados,
      fechaCompletado: new Date().toISOString()
    };
    
    // 5. Guardar en Firebase usando la función de dashboardService
    const saveResult = await saveTestResult(userId, year, testId, testResult);
    
    if (saveResult.success) {
      return {
        success: true,
        data: {
          ...testResult,
          firebaseResult: saveResult
        }
      };
    } else {
      throw new Error(saveResult.error || 'Error al guardar en Firebase');
    }
    
  } catch (error) {
    console.error('❌ Error calificando test:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Obtener respuestas correctas de un módulo
 */
export const getCorrectAnswers = (questions) => {
  const correctAnswers = {};
  
  questions.forEach((question, index) => {
    correctAnswers[index + 1] = question.respuestaCorrecta;
  });
  
  return correctAnswers;
};

/**
 * Calcular puntaje sin guardar (solo para vista previa)
 */
export const calculateScorePreview = (questions, userAnswers) => {
  let correct = 0;
  const total = questions.length;
  const details = [];
  
  questions.forEach((question, index) => {
    const qNumber = index + 1;
    const userAnswer = userAnswers[qNumber];
    const correctAnswer = question.respuestaCorrecta;
    const isCorrect = userAnswer == correctAnswer;
    
    if (isCorrect) correct++;
    
    details.push({
      question: qNumber,
      userAnswer,
      correctAnswer,
      isCorrect,
      text: question.pregunta.substring(0, 50) + '...'
    });
  });
  
  const percentage = Math.round((correct / total) * 100);
  
  return {
    correct,
    total,
    percentage,
    approved: percentage >= 70,
    details
  };
};