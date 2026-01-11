// src/services/testRetakeService.js
import { db } from './firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Verifica si el usuario puede retomar un test
 */
export const canRetakeTest = async (userId, year, moduleNumber, maxAttempts = 3) => {
  try {
    const yearKey = `año${year}`;
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      return { canRetake: true, attempts: 0, lastAttempt: null };
    }
    
    const progressData = progressDoc.data();
    const testKey = getTestKeyByModule(moduleNumber);
    const testData = progressData.tests?.[testKey];
    
    if (!testData) {
      return { canRetake: true, attempts: 0, lastAttempt: null };
    }
    
    // Contar intentos anteriores
    const attempts = testData.attempts || 1;
    const lastAttempt = testData.fechaCompletado;
    
    // Verificar límite de intentos
    const canRetake = attempts < maxAttempts;
    
    return {
      canRetake,
      attempts,
      lastAttempt,
      maxAttempts,
      lastScore: testData.porcentaje || 0
    };
    
  } catch (error) {
    console.error('Error verificando reintentos:', error);
    return { canRetake: true, attempts: 0, lastAttempt: null, error: error.message };
  }
};

/**
 * Guarda un nuevo intento de test (sobreescribe el anterior)
 */
export const saveRetakeTestResult = async (userId, year, testId, testData, isRetake = false) => {
  try {
    console.log(`🔄 Guardando ${isRetake ? 'reintento' : 'intento'} del test ${testId}`);
    
    const yearKey = `año${year}`;
    const testKey = getTestKeyByModule(testId, testData.moduleTitle);
    
    // Referencias
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const userRef = doc(db, "users", userId);
    
    // Obtener datos actuales
    const [progressDoc, userDoc] = await Promise.all([
      getDoc(progressRef),
      getDoc(userRef)
    ]);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    const currentProgress = progressDoc.exists() ? progressDoc.data() : null;
    const currentTests = currentProgress?.tests || {};
    const currentTest = currentTests[testKey];
    
    // Preparar datos del nuevo intento
    const totalQuestions = testData.totalPreguntas || 5;
    const correctAnswers = testData.puntajeObtenido || 0;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const approved = percentage >= 70;
    
    // Contar intentos
    const previousAttempts = currentTest?.attempts || 0;
    const attemptNumber = previousAttempts + 1;
    
    // Crear historial de intentos si no existe
    const attemptHistory = currentTest?.attemptHistory || [];
    if (currentTest) {
      attemptHistory.push({
        fecha: currentTest.fechaCompletado || serverTimestamp(),
        puntaje: currentTest.porcentaje || 0,
        aprobado: currentTest.aprobado || false,
        intento: previousAttempts
      });
    }
    
    // Datos del nuevo test
    const newTestData = {
      id: testKey,
      moduloId: `modulo${testId}`,
      moduloNombre: getModuleSlug(testId, testData.moduleTitle),
      moduloNombreCompleto: testData.moduleTitle,
      totalPreguntas: totalQuestions,
      puntajeObtenido: correctAnswers,
      porcentaje: percentage,
      aprobado: approved,
      preguntas: testData.preguntas || {},
      fechaCompletado: serverTimestamp(),
      attempts: attemptNumber,
      attemptHistory: attemptHistory,
      isRetake: isRetake,
      previousScore: currentTest?.porcentaje || 0
    };
    
    console.log(`📝 Guardando intento ${attemptNumber} para ${testKey}`);
    
    // Actualizar progress/añoX
    const progressUpdate = {
      [`tests.${testKey}`]: newTestData,
      metadata: {
        actualizadoEL: serverTimestamp()
      }
    };
    
    // Si es el primer intento en este año, inicializar estructura
    if (!currentProgress) {
      progressUpdate.userId = userId;
      progressUpdate.año = year;
      progressUpdate.metadata = {
        creadoEL: serverTimestamp(),
        actualizadoEL: serverTimestamp()
      };
      progressUpdate.fechaCreacion = serverTimestamp();
    }
    
    // Actualizar users/progreso/añoX
    const userUpdate = {};
    const userYearProgress = userData.progreso?.[yearKey] || {};
    const moduleNumber = parseInt(testId);
    
    // Actualizar niveles aprobados si cambió el estado
    let nivelesAprobados = userYearProgress.nivelesAprobados || 0;
    const wasApproved = moduleNumber <= nivelesAprobados;
    
    if (approved && !wasApproved) {
      nivelesAprobados += 1;
    } else if (!approved && wasApproved) {
      nivelesAprobados = Math.max(0, nivelesAprobados - 1);
    }
    
    const totalNiveles = userYearProgress.totalNiveles || (year === 1 ? 6 : 8);
    const nivelesCompletados = Math.max(userYearProgress.nivelesCompletados || 0, moduleNumber);
    const completado = nivelesCompletados >= totalNiveles;
    
    // Calcular nuevo promedio considerando todos los tests
    const allTests = { ...currentTests, [testKey]: newTestData };
    const testPercentages = Object.values(allTests)
      .filter(t => t.porcentaje !== undefined)
      .map(t => t.porcentaje);
    
    const promedioPuntaje = testPercentages.length > 0
      ? Math.round(testPercentages.reduce((sum, p) => sum + p, 0) / testPercentages.length)
      : percentage;
    
    userUpdate[`progreso.${yearKey}`] = {
      ...userYearProgress,
      nivelesCompletados,
      nivelesAprobados,
      promedioPuntaje,
      completado,
      totalNiveles,
      ultimaActualizacion: serverTimestamp()
    };
    
    userUpdate.ultimoAcceso = serverTimestamp();
    
    // Ejecutar actualizaciones
    await Promise.all([
      progressDoc.exists() 
        ? updateDoc(progressRef, progressUpdate)
        : updateDoc(progressRef, progressUpdate),
      updateDoc(userRef, userUpdate)
    ]);
    
    console.log(`✅ Intento ${attemptNumber} guardado exitosamente`);
    
    return {
      success: true,
      data: {
        test: newTestData,
        attemptNumber,
        previousScore: currentTest?.porcentaje || 0,
        improvement: currentTest ? percentage - (currentTest.porcentaje || 0) : 0
      }
    };
    
  } catch (error) {
    console.error('❌ Error guardando reintento:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Obtiene el historial de intentos de un test
 */
export const getTestAttemptHistory = async (userId, year, moduleNumber) => {
  try {
    const yearKey = `año${year}`;
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      return [];
    }
    
    const progressData = progressDoc.data();
    const testKey = getTestKeyByModule(moduleNumber);
    const testData = progressData.tests?.[testKey];
    
    if (!testData) {
      return [];
    }
    
    const history = testData.attemptHistory || [];
    
    // Agregar el intento actual al historial
    if (testData.fechaCompletado) {
      history.push({
        fecha: testData.fechaCompletado,
        puntaje: testData.porcentaje,
        aprobado: testData.aprobado,
        intento: testData.attempts || 1
      });
    }
    
    // Ordenar por fecha (más reciente primero)
    return history.sort((a, b) => {
      const dateA = a.fecha?.seconds || 0;
      const dateB = b.fecha?.seconds || 0;
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
};

/**
 * Elimina todos los intentos de un test (reiniciar)
 */
export const resetTestAttempts = async (userId, year, moduleNumber) => {
  try {
    const yearKey = `año${year}`;
    const testKey = getTestKeyByModule(moduleNumber);
    
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      return { success: true, message: "No hay intentos previos" };
    }
    
    const updateData = {
      [`tests.${testKey}.attempts`]: 1,
      [`tests.${testKey}.attemptHistory`]: [],
      [`tests.${testKey}.isRetake`]: false,
      [`tests.${testKey}.previousScore`]: 0,
      metadata: {
        actualizadoEL: serverTimestamp()
      }
    };
    
    await updateDoc(progressRef, updateData);
    
    return { success: true, message: "Intentos reiniciados" };
    
  } catch (error) {
    console.error('Error reiniciando intentos:', error);
    return { success: false, error: error.message };
  }
};

// Funciones auxiliares
const getTestKeyByModule = (moduleNumber, moduleTitle = '') => {
  const keyMap = {
    1: 'test_intro_001',
    2: 'test_soporte_001',
    3: 'test_so_001',
    4: 'test_ofi_001',
    5: 'test_inter_001',
    6: 'test_prog_001'
  };
  
  return keyMap[moduleNumber] || `test_modulo${moduleNumber}_001`;
};

const getModuleSlug = (testId, moduleTitle = '') => {
  const slugs = {
    1: 'introduccion_informatica',
    2: 'soporte_tecnico',
    3: 'sistema_operativo',
    4: 'ofimatica_basica',
    5: 'internet_seguro',
    6: 'programacion_basica'
  };
  
  return slugs[testId] || `modulo_${testId}`;
};