// src/utils/moduleMapper.js

/**
 * Mapea el ID del módulo a su número correspondiente
 * Ej: "1ro_modulo_1" -> 1, "2do_modulo_3" -> 3, etc.
 */
export const getModuleNumberFromId = (moduleId) => {
  if (!moduleId) return 1;
  
  console.log('🔍 Analizando ID del módulo:', moduleId);
  
  // Intentar extraer número del ID
  const match = moduleId.match(/(\d+ro|2do)_modulo_(\d+)/i) || 
                moduleId.match(/modulo_(\d+)/i) || 
                moduleId.match(/(\d+)$/);
  
  if (match) {
    // Si el patrón es "1ro_modulo_1", el número está en el tercer grupo
    const number = parseInt(match[2] || match[1]);
    console.log(`✅ Número extraído del ID ${moduleId}: ${number}`);
    return number || 1;
  }
  
  // Buscar por palabras clave en el ID
  const lowerId = moduleId.toLowerCase();
  
  const keywordMapping = {
    'intro': 1,
    'soporte': 2,
    'sistema_operativo': 3,
    'so': 3,
    'ofimatica': 4,
    'ofi': 4,
    'internet': 5,
    'inter': 5,
    'programacion': 6,
    'prog': 6,
    'algoritmo': 7,
    'algo': 7,
    'programacion_media': 8,
    'pma': 8,
    'diseno_web': 9,
    'web': 9,
    'seguridad': 10,
    'seg': 10,
    'base_datos': 11,
    'bd': 11,
    'poo': 12,
    'redes': 13,
    'red': 13,
    'pensamiento_computacional': 14,
    'pc': 14
  };
  
  for (const [keyword, number] of Object.entries(keywordMapping)) {
    if (lowerId.includes(keyword)) {
      console.log(`✅ Número por palabra clave "${keyword}" en ${moduleId}: ${number}`);
      return number;
    }
  }
  
  console.log(`⚠️ No se pudo determinar número del módulo ${moduleId}, usando 1 por defecto`);
  return 1;
};

/**
 * Obtiene el título del módulo basado en su número
 */
export const getModuleTitleByNumber = (moduleNumber) => {
  const moduleTitles = {
    1: 'Introducción a la Informática',
    2: 'Soporte Técnico',
    3: 'Sistema Operativo',
    4: 'Ofimática Básica',
    5: 'Internet Seguro',
    6: 'Programación Básica',
    7: 'Algoritmos y Lógica de Programación',
    8: 'Programación Media Avanzada',
    9: 'Diseño Web Básico (HTML y CSS)',
    10: 'Seguridad Informática',
    11: 'Bases de Datos Básicas',
    12: 'Programación Orientada a Objetos (POO)',
    13: 'Redes Informáticas Básicas',
    14: 'Pensamiento Computacional y Resolución de Problemas'
  };
  
  return moduleTitles[moduleNumber] || `Módulo ${moduleNumber}`;
};

/**
 * Obtiene el nombre del archivo HTML para el módulo
 */
export const getModuleFilename = (moduleNumber, year = 1) => {
  const yearPrefix = year === 1 ? '1ro' : '2do';
  return `${yearPrefix}_modulo_${moduleNumber}.html`;
};