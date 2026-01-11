// src/services/progressService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion
} from "firebase/firestore";
import { db } from "./firebase/config";

// Función principal de progreso combinado
export const getCombinedUserProgress = async (userId) => {
  try {
    // Primero obtener progreso de los documentos principal y subcolección
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    
    // Obtener progreso detallado de la subcolección progress
    const progressCollectionRef = collection(db, "users", userId, "progress");
    const progressSnapshot = await getDocs(progressCollectionRef);
    
    const progressData = {};
    progressSnapshot.forEach(doc => {
      progressData[doc.id] = doc.data();
    });
    
    // Combinar ambos conjuntos de datos
    const combinedProgress = {
      // Progreso general del documento principal
      general: {
        año1: userData.progreso?.año1 || {},
        año2: userData.progreso?.año2 || {}
      },
      // Progreso detallado de la subcolección
      detallado: progressData
    };
    
    // También crear estructura plana para compatibilidad
    const flatProgress = {
      año1: {
        ...userData.progreso?.año1,
        tests: progressData.año1?.tests || {}
      },
      año2: {
        ...userData.progreso?.año2,
        tests: progressData.año2?.tests || {}
      }
    };
    
    return flatProgress;
    
  } catch (error) {
    console.error("Error obteniendo progreso combinado:", error);
    return {
      año1: {
        completado: false,
        nivelesCompletados: 0,
        nivelesAprobados: 0,
        totalNiveles: 6,
        promedioPuntaje: 0,
        tests: {}
      },
      año2: {
        completado: false,
        nivelesCompletados: 0,
        nivelesAprobados: 0,
        totalNiveles: 8,
        promedioPuntaje: 0,
        tests: {}
      }
    };
  }
};

// Función para obtener estadísticas del usuario
export const getUserStats = async (userId, year) => {
  try {
    const progress = await getCombinedUserProgress(userId);
    const yearKey = `año${year}`;
    const yearData = progress[yearKey] || {};
    
    // Obtener todos los módulos del año
    const modulesSnapshot = await getDocs(
      collection(db, "modules")
    );
    
    const modules = [];
    modulesSnapshot.forEach(doc => {
      if (doc.data().año === year) {
        modules.push({ id: doc.id, ...doc.data() });
      }
    });
    
    // Calcular estadísticas
    const totalModules = modules.length;
    let completed = 0;
    let inProgress = 0;
    
    // Verificar progreso de cada módulo
    if (yearData.tests) {
      Object.values(yearData.tests).forEach(test => {
        if (test.estado === "completado" || test.aprobado) {
          completed++;
        } else if (test.fechaInicio) {
          inProgress++;
        }
      });
    }
    
    const notStarted = totalModules - completed - inProgress;
    
    return {
      total: totalModules,
      completed,
      inProgress,
      notStarted,
      averageScore: yearData.promedioPuntaje || 0,
      bestScore: yearData.tests ? 
        Math.max(...Object.values(yearData.tests)
          .map(t => t.porcentaje || 0)
          .filter(score => score > 0)
        ) : 0,
      totalTimeSpent: yearData.tiempoTotal || 0
    };
    
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      total: year === 1 ? 6 : 8,
      completed: 0,
      inProgress: 0,
      notStarted: year === 1 ? 6 : 8,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0
    };
  }
};

// Función para obtener progreso por módulo
export const getUserModuleProgress = async (userId, year) => {
  try {
    const progress = await getCombinedUserProgress(userId);
    const yearKey = `año${year}`;
    const yearData = progress[yearKey] || {};
    
    // Obtener módulos del año
    const modulesSnapshot = await getDocs(
      collection(db, "modules")
    );
    
    const moduleProgress = {};
    
    modulesSnapshot.forEach(doc => {
      const module = doc.data();
      if (module.año === year) {
        const moduleId = doc.id;
        const testData = yearData.tests?.[`test${module.orden}`];
        
        if (testData) {
          // Módulo completado
          moduleProgress[moduleId] = {
            completado: testData.aprobado || testData.estado === "completado",
            fechaInicio: testData.tiempoInicio,
            fechaCompletado: testData.tiempoFin,
            testResultado: {
              puntaje: testData.puntajeObtenido,
              porcentaje: testData.porcentaje,
              aprobado: testData.aprobado
            },
            intentos: testData.intentos || 1
          };
        } else {
          // Módulo no iniciado
          moduleProgress[moduleId] = {
            completado: false,
            fechaInicio: null,
            fechaCompletado: null,
            testResultado: null
          };
        }
      }
    });
    
    return moduleProgress;
    
  } catch (error) {
    console.error("Error obteniendo progreso por módulo:", error);
    return {};
  }
};

// Función para guardar resultado de test (mantener compatibilidad)
export const saveTestResult = async (userId, año, testId, testData) => {
  try {
    // Guardar en la subcolección progress
    const progressRef = doc(db, "users", userId, "progress", `año${año}`);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      // Crear documento si no existe
      await setDoc(progressRef, {
        userId: userId,
        año: año,
        totalTests: año === 1 ? 6 : 8,
        tests: {},
        resumen: {
          completado: false,
          testsCompletados: 0,
          testsAprobados: 0,
          promedioGeneral: 0,
          mejorPuntaje: 0,
          peorPuntaje: 0,
          tiempoTotal: 0
        },
        metadata: {
          creadoEl: serverTimestamp(),
          actualizadoEl: serverTimestamp()
        }
      });
    }
    
    const testKey = `test${testId}`;
    const currentData = progressDoc.exists() ? progressDoc.data() : {};
    const currentTests = currentData.tests || {};
    
    // Calcular nuevos valores para el resumen
    const testsCompletados = currentData.resumen?.testsCompletados || 0;
    const testsAprobados = currentData.resumen?.testsAprobados || 0;
    
    // Crear objeto de test
    const testResult = {
      testId: testId,
      fechaRealizacion: serverTimestamp(),
      tiempoInicio: testData.tiempoInicio || serverTimestamp(),
      tiempoFin: serverTimestamp(),
      duracion: testData.duracion || 0,
      puntajeObtenido: testData.puntajeObtenido,
      puntajeMaximo: testData.puntajeMaximo,
      porcentaje: testData.porcentaje,
      aprobado: testData.aprobado,
      estado: testData.estado || "completado",
      respuestas: testData.respuestas || [],
      metadata: testData.metadata || {}
    };
    
    // Actualizar documento
    await updateDoc(progressRef, {
      [`tests.${testKey}`]: testResult,
      "resumen.testsCompletados": testsCompletados + 1,
      "resumen.testsAprobados": testsAprobados + (testData.aprobado ? 1 : 0),
      "resumen.tiempoTotal": increment(testData.duracion || 0),
      "metadata.actualizadoEl": serverTimestamp()
    });
    
    // Actualizar también el documento principal del usuario
    await updateUserProgressSummary(userId, año);
    
    return { success: true, testResult };
    
  } catch (error) {
    console.error("Error guardando resultado de test:", error);
    return { success: false, error: error.message };
  }
};

// Función para actualizar resumen en documento principal
const updateUserProgressSummary = async (userId, año) => {
  try {
    // Obtener progreso detallado
    const progressRef = doc(db, "users", userId, "progress", `año${año}`);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) return;
    
    const progressData = progressDoc.data();
    const tests = Object.values(progressData.tests || {});
    
    // Calcular estadísticas
    const testsCompletados = tests.length;
    const testsAprobados = tests.filter(t => t.aprobado).length;
    const promedio = tests.length > 0 
      ? tests.reduce((sum, t) => sum + (t.porcentaje || 0), 0) / tests.length 
      : 0;
    
    // Actualizar documento principal
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`progreso.año${año}.nivelesCompletados`]: testsCompletados,
      [`progreso.año${año}.nivelesAprobados`]: testsAprobados,
      [`progreso.año${año}.promedioPuntaje`]: promedio,
      [`progreso.año${año}.completado`]: testsCompletados === progressData.totalTests,
      ultimoAcceso: serverTimestamp()
    });
    
    return { success: true };
    
  } catch (error) {
    console.error("Error actualizando resumen:", error);
    return { success: false, error: error.message };
  }
};

// Objeto principal para compatibilidad con código existente
const progressService = {
  getCombinedUserProgress,
  getUserStats,
  getUserModuleProgress,
  saveTestResult
};

export { progressService };