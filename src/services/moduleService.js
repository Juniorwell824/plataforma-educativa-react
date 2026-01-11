import { db } from './firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

/**
 * Convierte número de año a formato de Firebase
 * Ej: 1 -> "Iro", 2 -> "2do"
 */
const formatYearForFirebase = (year) => {
  switch(year.toString()) {
    case '1':
      return 'Iro';
    case '2':
      return '2do';
    default:
      return year.toString();
  }
};

/**
 * Obtener todos los módulos de un año específico
 */
export const getModulesByYear = async (year) => {
  try {
    const formattedYear = formatYearForFirebase(year);
    const modulesRef = collection(db, 'modules');
    const q = query(
      modulesRef,
      where('año', '==', formattedYear),
      orderBy('orden', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const modules = [];
    
    querySnapshot.forEach((doc) => {
      modules.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return modules;
  } catch (error) {
    console.error('Error obteniendo módulos:', error);
    throw error;
  }
};

/**
 * Obtener un módulo específico por ID
 */
export const getModuleById = async (moduleId) => {
  try {
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleDoc = await getDoc(moduleRef);
    
    if (moduleDoc.exists()) {
      return {
        id: moduleDoc.id,
        ...moduleDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo módulo:', error);
    throw error;
  }
};

/**
 * Obtener módulos según estado (completados, en progreso, etc.)
 */
export const getModulesByStatus = async (userId, year, status) => {
  try {
    // Primero obtener progreso del usuario
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    let completedModules = [];
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Obtener módulos completados según la estructura que tienes
      // progress_iro_modulo_1_attempt_1 contiene el moduleId
      const progressRef = collection(db, `users/${userId}/progress`);
      const progressSnapshot = await getDocs(progressRef);
      
      progressSnapshot.forEach((doc) => {
        const progressData = doc.data();
        if (progressData.completado && progressData.moduleId) {
          completedModules.push(progressData.moduleId);
        }
      });
    }
    
    // Obtener todos los módulos del año
    const allModules = await getModulesByYear(year);
    
    // Filtrar según estado
    return allModules.filter(module => {
      if (status === 'completed') {
        return completedModules.includes(module.id);
      } else if (status === 'not-started') {
        return !completedModules.includes(module.id);
      }
      return true; // 'all' o 'in-progress'
    });
    
  } catch (error) {
    console.error('Error obteniendo módulos por estado:', error);
    throw error;
  }
};

/**
 * Obtener preguntas de un módulo
 */
export const getModuleQuestions = async (moduleId) => {
  try {
    const module = await getModuleById(moduleId);
    return module?.preguntas || [];
  } catch (error) {
    console.error('Error obteniendo preguntas:', error);
    throw error;
  }
};