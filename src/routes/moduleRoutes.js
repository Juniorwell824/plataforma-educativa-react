// src/routes/moduleRoutes.js
import { getModuleFilename } from '../utils/moduleMapper';

/**
 * Obtiene la ruta correcta para un módulo
 */
export const getModuleRoute = (moduleNumber, year = 1) => {
  const filename = getModuleFilename(moduleNumber, year);
  return `/module/${moduleNumber}`; // La ruta que usa React Router
};

/**
 * Obtiene el archivo HTML para un módulo
 */
export const getModuleHTMLFile = (moduleNumber, year = 1) => {
  return getModuleFilename(moduleNumber, year);
};

/**
 * Configuración de rutas por módulo
 */
export const moduleRoutes = {
  1: { path: '/module/1', file: '1ro_modulo_1.html', title: 'Introducción a la Informática' },
  2: { path: '/module/2', file: '1ro_modulo_2.html', title: 'Soporte Técnico' },
  3: { path: '/module/3', file: '1ro_modulo_3.html', title: 'Sistema Operativo' },
  4: { path: '/module/4', file: '1ro_modulo_4.html', title: 'Ofimática Básica' },
  5: { path: '/module/5', file: '1ro_modulo_5.html', title: 'Internet Seguro' },
  6: { path: '/module/6', file: '1ro_modulo_6.html', title: 'Programación Básica' },
  7: { path: '/module/7', file: '2do_modulo_1.html', title: 'Algoritmos y Lógica de Programación' },
  8: { path: '/module/8', file: '2do_modulo_2.html', title: 'Programación Media Avanzada' },
  9: { path: '/module/9', file: '2do_modulo_3.html', title: 'Diseño Web Básico (HTML y CSS)' },
  10: { path: '/module/10', file: '2do_modulo_4.html', title: 'Seguridad Informática' },
  11: { path: '/module/11', file: '2do_modulo_5.html', title: 'Bases de Datos Básicas' },
  12: { path: '/module/12', file: '2do_modulo_6.html', title: 'Programación Orientada a Objetos (POO)' },
  13: { path: '/module/13', file: '2do_modulo_7.html', title: 'Redes Informáticas Básicas' },
  14: { path: '/module/14', file: '2do_modulo_8.html', title: 'Pensamiento Computacional y Resolución de Problemas' }
};