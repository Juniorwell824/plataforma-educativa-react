// src/utils/initializeProgress.js
import { 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp, 
  collection 
} from "firebase/firestore";
import { db } from "../services/firebase/config";

/**
 * Inicializa la subcolección progress para un estudiante
 * @param {string} userId - ID del usuario (string)
 * @param {number} year - Año académico (1 o 2)
 */
export const initializeStudentProgress = async (userId, year = 1) => {
  try {
    // Validar que userId sea un string
    if (typeof userId !== 'string') {
      console.error('❌ Error: userId debe ser string, recibido:', typeof userId, userId);
      throw new Error('userId debe ser un string');
    }
    
    if (!userId || userId.trim() === '') {
      throw new Error('userId no puede estar vacío');
    }
    
    console.log(`🏗️ Inicializando progress para usuario: ${userId}, año: ${year}`);
    
    // Primero, crear documento para el año específico
    const progressRef = doc(db, "users", userId, "progress", `año${year}`);
    
    const progressData = {
      userId: userId,
      año: year,
      fechaCreacion: serverTimestamp(),
      totalTests: year === 1 ? 6 : 8,
      tests: {}, // Objeto vacío que se llenará con los tests
      resumen: {
        completado: false,
        testsCompletados: 0,
        testsAprobados: 0,
        promedioGeneral: 0,
        mejorPuntaje: 0,
        peorPuntaje: 100,
        tiempoTotal: 0 // en minutos
      },
      metadata: {
        creadoEl: serverTimestamp(),
        actualizadoEl: serverTimestamp()
      }
    };
    
    await setDoc(progressRef, progressData);
    console.log(`✅ Progress inicializado para año ${year}`);
    
    // Si es año 1, también crear año 2 por defecto
    if (year === 1) {
      const progressYear2Ref = doc(db, "users", userId, "progress", "año2");
      const progressYear2Data = {
        userId: userId,
        año: 2,
        fechaCreacion: serverTimestamp(),
        totalTests: 8,
        tests: {},
        resumen: {
          completado: false,
          testsCompletados: 0,
          testsAprobados: 0,
          promedioGeneral: 0,
          mejorPuntaje: 0,
          peorPuntaje: 100,
          tiempoTotal: 0
        },
        metadata: {
          creadoEl: serverTimestamp(),
          actualizadoEl: serverTimestamp()
        }
      };
      
      await setDoc(progressYear2Ref, progressYear2Data);
      console.log(`✅ Progress inicializado para año 2 también`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error inicializando progress:`, error);
    console.error('Detalles:', {
      userId: userId,
      tipoUserId: typeof userId,
      year: year,
      errorMessage: error.message,
      errorStack: error.stack
    });
    throw error;
  }
};

/**
 * Función para inicializar ambos años
 */
export const initializeAllYearsProgress = async (userId) => {
  try {
    console.log(`🏗️ Inicializando progress completo para: ${userId}`);
    
    // Inicializar ambos años
    await initializeStudentProgress(userId, 1);
    await initializeStudentProgress(userId, 2);
    
    console.log(`✅ Progress completo inicializado`);
    return true;
  } catch (error) {
    console.error('❌ Error inicializando progress completo:', error);
    throw error;
  }
};

/**
 * Verifica si el progress existe y lo crea si no
 */
export const ensureProgressExists = async (userId) => {
  try {
    console.log(`🔍 Verificando progress para: ${userId}`);
    
    // Verificar año 1
    const year1Ref = doc(db, "users", userId, "progress", "año1");
    const year1Doc = await getDoc(year1Ref);
    
    if (!year1Doc.exists()) {
      console.log(`⚠️ Progress no existe. Creando...`);
      await initializeAllYearsProgress(userId);
      return { created: true };
    }
    
    console.log(`✅ Progress ya existe`);
    return { exists: true };
    
  } catch (error) {
    console.error('❌ Error verificando progress:', error);
    throw error;
  }
};