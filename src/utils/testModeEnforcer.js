// src/utils/testModeEnforcer.js

/**
 * Forzar que todos los módulos se abran en modo interactivo
 */
export const enforceInteractiveMode = (moduleData) => {
  return {
    ...moduleData,
    isViewOnly: false,
    canTakeTest: true,
    canRetake: true,
    showRetakeOption: true,
    isRetake: moduleData.estado === 'aprobado' || moduleData.estado === 'reprobado',
    // Asegurar que siempre tengamos el número de módulo
    moduleNumber: extractModuleNumber(moduleData),
    // Asegurar título
    moduleTitle: moduleData.title || getModuleTitle(extractModuleNumber(moduleData))
  };
};

/**
 * Extraer número de módulo de varias formas posibles
 */
const extractModuleNumber = (moduleData) => {
  // Intentar por orden de prioridad
  if (moduleData.numeroModulo) return moduleData.numeroModulo;
  if (moduleData.order) return moduleData.order;
  if (moduleData.testId) return moduleData.testId;
  
  // Extraer del ID
  if (moduleData.id) {
    const match = moduleData.id.match(/(\d+)$/);
    if (match) return parseInt(match[1]);
  }
  
  return 1; // Por defecto
};

/**
 * Obtener título del módulo
 */
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