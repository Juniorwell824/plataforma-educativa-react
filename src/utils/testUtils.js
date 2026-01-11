// src/utils/testUtils.js

/**
 * Procesa respuestas del usuario para el formato de Firebase
 */
export const processAnswersForFirebase = (userAnswers, questions) => {
  const processed = {};
  
  Object.entries(userAnswers).forEach(([questionNum, answer]) => {
    const qIndex = parseInt(questionNum) - 1;
    const question = questions[qIndex];
    
    if (question) {
      processed[`q${questionNum}`] = {
        id: `q${questionNum}`,
        idPregunta: `q${questionNum}`,
        idModulo: question.idModulo || `modulo${questions.length > 6 ? 2 : 1}`,
        respuestaUsuario: answer.toString(),
        respuestaCorrecta: question.respuestaCorrecta.toString(),
        esCorrecta: answer == question.respuestaCorrecta,
        puntaje: answer == question.respuestaCorrecta ? 1 : 0
      };
    }
  });
  
  return processed;
};

/**
 * Genera resumen de test
 */
export const generateTestSummary = (questions, userAnswers) => {
  const total = questions.length;
  let correct = 0;
  
  questions.forEach((question, index) => {
    const qNum = index + 1;
    if (userAnswers[qNum] == question.respuestaCorrecta) {
      correct++;
    }
  });
  
  const percentage = Math.round((correct / total) * 100);
  
  return {
    totalPreguntas: total,
    puntajeObtenido: correct,
    porcentaje: percentage,
    aprobado: percentage >= 70,
    fechaCompletado: new Date()
  };
};

/**
 * Valida si el usuario puede tomar el test
 */
export const canTakeTest = (moduleStatus, moduleProgress) => {
  // Si está pendiente o en progreso, puede tomar
  if (moduleStatus === 'pendiente' || moduleStatus === 'en-progreso') {
    return true;
  }
  
  // Si ya está completado, verificar si puede retomar
  if (moduleStatus === 'reprobado') {
    return true; // Permitir retomar si reprobó
  }
  
  // Si ya aprobó, no puede retomar (a menos que sea admin)
  return false;
};