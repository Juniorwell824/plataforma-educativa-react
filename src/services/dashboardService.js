// src/services/dashboardService.js - VERSIÓN FINAL SIN ERRORES
import { db } from './firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

/**
 * FUNCIÓN PRINCIPAL - Obtiene datos del dashboard
 */
const getDashboardData = async (userId, year) => {
  try {
    console.log(`🚀 getDashboardData para usuario ${userId}, año ${year}`);

    if (!userId) throw new Error('Usuario no autenticado');

    // 1. Obtener progreso de la subcolección progress
    const userProgress = await getProgressFromSubcollection(userId, year);
    console.log('📊 Progreso obtenido:', userProgress);

    // 2. Obtener módulos del año
    const modules = await getModulesByYear(year);
    console.log(`📚 Módulos obtenidos: ${modules.length}`);

    // 3. Determinar estado de cada módulo
    const modulesWithStatus = determineModuleStatus(modules, userProgress, year);

    // 4. Calcular estadísticas
    const stats = calculateStats(modulesWithStatus);

    // 5. Preparar datos para el dashboard
    const result = prepareDashboardResult(modulesWithStatus, stats, year, userProgress);

    console.log('✅ Dashboard generado:', {
      totalModules: result.modules.length,
      aprobados: result.stats.approved,
      reprobados: result.stats.reprobados,
      enProgreso: result.stats.enProgreso,
      pendientes: result.stats.pendientes
    });

    return result;

  } catch (error) {
    console.error('❌ Error en getDashboardData:', error);
    return getFallbackData(year);
  }
};

/**
 * 1. Obtener progreso desde subcolección progress
 */
const getProgressFromSubcollection = async (userId, year) => {
  try {
    const yearKey = year === 1 ? 'año1' : 'año2';
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      return progressDoc.data();
    }

    // Si no existe en subcolección, usar datos principales
    return await getProgressFromMain(userId, year);

  } catch (error) {
    console.error('❌ Error obteniendo progreso:', error);
    return {
      testsCompletados: 0,
      testsAprobados: 0,
      promedioGeneral: 0,
      tests: {},
      resumen: {}
    };
  }
};

/**
 * Obtener progreso desde datos principales si no hay subcolección
 */
const getProgressFromMain = async (userId, year) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const yearKey = `año${year}`;
    const progress = userData.progreso?.[yearKey] || {};

    return {
      testsCompletados: progress.nivelesCompletados || 0,
      testsAprobados: progress.nivelesAprobados || 0,
      promedioGeneral: progress.promedioPuntaje || 0,
      tests: {},
      resumen: {
        completado: progress.completado || false,
        mejorPuntaje: progress.promedioPuntaje || 0
      }
    };
  }

  return {
    testsCompletados: 0,
    testsAprobados: 0,
    promedioGeneral: 0,
    tests: {},
    resumen: {}
  };
};

/**
 * 2. Obtener módulos por año
 */
const getModulesByYear = async (year) => {
  try {
    const yearPrefix = year === 1 ? '1ro' : '2do';
    const modulesRef = collection(db, "modules");

    // Intentar consulta por campo año
    const q = query(
      modulesRef,
      where("año", "==", yearPrefix),
      orderBy("orden", "asc")
    );

    const querySnapshot = await getDocs(q);
    const modules = [];

    querySnapshot.forEach((doc) => {
      modules.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Si no encuentra, usar datos por defecto
    if (modules.length === 0) {
      return getDefaultModules(year);
    }

    return modules;

  } catch (error) {
    console.error('❌ Error obteniendo módulos:', error);
    return getDefaultModules(year);
  }
};

/**
 * 3. Determinar estado de cada módulo - LÓGICA PRINCIPAL
 */
const determineModuleStatus = (modules, userProgress, year) => {
  return modules.map((module, index) => {
    const moduleNumber = index + 1;

    // Buscar test específico para este módulo
    const testData = findTestForModule(moduleNumber, userProgress.tests || {});

    // Determinar estado basado en test
    if (testData) {
      const aprobado = testData.aprobado === true || (testData.porcentaje || 0) >= 70;

      return {
        ...formatModuleData(module, moduleNumber, year),
        status: 'completed',
        etiqueta: aprobado ? '✅ APROBADO' : '❌ REPROBADO',
        estado: aprobado ? 'aprobado' : 'reprobado',
        aprobado: aprobado,
        progress: 100,
        porcentaje: testData.porcentaje || 0,
        testInfo: {
          porcentaje: testData.porcentaje,
          aprobado: testData.aprobado,
          fecha: testData.fechaCompletado,
          puntajeObtenido: testData.puntajeObtenido,
          totalPreguntas: testData.totalPreguntas
        },
        colorEtiqueta: aprobado ? '#10b981' : '#ef4444',
        mostrarBarraProgreso: false
      };
    }

    // Si no hay test, verificar si está completado según testsCompletados
    if (moduleNumber <= (userProgress.testsCompletados || 0)) {
      // Determinar si fue aprobado según testsAprobados
      const fueAprobado = moduleNumber <= (userProgress.testsAprobados || 0);

      return {
        ...formatModuleData(module, moduleNumber, year),
        status: 'completed',
        etiqueta: fueAprobado ? '✅ APROBADO' : '❌ REPROBADO',
        estado: fueAprobado ? 'aprobado' : 'reprobado',
        aprobado: fueAprobado,
        progress: 100,
        porcentaje: fueAprobado ? 100 : 0,
        testInfo: null,
        colorEtiqueta: fueAprobado ? '#10b981' : '#ef4444',
        mostrarBarraProgreso: false
      };
    }

    // Verificar si es el módulo en progreso
    const esEnProgreso = moduleNumber === (userProgress.testsCompletados || 0) + 1;

    if (esEnProgreso) {
      return {
        ...formatModuleData(module, moduleNumber, year),
        status: 'in-progress',
        etiqueta: '⏳ EN PROGRESO',
        estado: 'en-progreso',
        aprobado: false,
        progress: 50,
        porcentaje: 0,
        testInfo: null,
        colorEtiqueta: '#f59e0b',
        mostrarBarraProgreso: true
      };
    }

    // Módulo pendiente
    return {
      ...formatModuleData(module, moduleNumber, year),
      status: 'pending',
      etiqueta: '📝 PENDIENTE',
      estado: 'pendiente',
      aprobado: false,
      progress: 0,
      porcentaje: 0,
      testInfo: null,
      colorEtiqueta: '#6b7280',
      mostrarBarraProgreso: true
    };
  });
};

/**
 * Buscar test específico para un módulo
 */
const findTestForModule = (moduleNumber, tests) => {
  const testEntries = Object.entries(tests);

  for (const [testKey, testData] of testEntries) {
    // Intentar determinar a qué módulo pertenece este test
    if (testData.moduloId) {
      const match = testData.moduloId.match(/modulo(\d+)/i);
      if (match && parseInt(match[1]) === moduleNumber) {
        return testData;
      }
    }

    // Buscar por nombre del módulo
    const moduleNames = {
      'introduccion_informatica': 1,
      'soporte_tecnico': 2,
      'sistema_operativo': 3,
      'ofimatica_basica': 4,
      'internet_seguro': 5,
      'programacion_basica': 6
    };

    if (testData.moduloNombre && moduleNames[testData.moduloNombre] === moduleNumber) {
      return testData;
    }

    // Buscar por patrón en el ID del test
    const testPatterns = {
      1: /intro/i,
      2: /soporte/i,
      3: /sistema.*operativo|so/i,
      4: /ofimatica/i,
      5: /internet/i,
      6: /programacion/i
    };

    if (testPatterns[moduleNumber] && testPatterns[moduleNumber].test(testKey)) {
      return testData;
    }
  }

  return null;
};

/**
 * Formatear datos básicos del módulo
 */
const formatModuleData = (module, moduleNumber, year) => {
  return {
    id: module.id || `modulo_${moduleNumber}`,
    title: module.titulo || `Módulo ${moduleNumber}`,
    description: module.descripcion || 'Contenido educativo',
    icon: module.icon || getModuleIcon(moduleNumber),
    difficulty: module.dificultad || 'básico',
    duration: `${module.duracionEstimada || 120} min`,
    order: module.orden || moduleNumber,
    moduleData: module,
    archivo: module.archivo || null,
    año: module.año || (year === 1 ? '1ro' : '2do'),
    numeroModulo: moduleNumber
  };
};

/**
 * 4. Calcular estadísticas
 */
const calculateStats = (modules) => {
  const aprobados = modules.filter(m => m.etiqueta === '✅ APROBADO').length;
  const reprobados = modules.filter(m => m.etiqueta === '❌ REPROBADO').length;
  const enProgreso = modules.filter(m => m.etiqueta === '⏳ EN PROGRESO').length;
  const pendientes = modules.filter(m => m.etiqueta === '📝 PENDIENTE').length;
  const totalCompletados = aprobados + reprobados;

  // Calcular promedio de porcentaje de módulos completados
  const modulosCompletados = modules.filter(m => m.estado === 'aprobado' || m.estado === 'reprobado');
  const promedioPorcentaje = modulosCompletados.length > 0
    ? Math.round(modulosCompletados.reduce((sum, m) => sum + (m.porcentaje || 0), 0) / modulosCompletados.length)
    : 0;

  return {
    total: modules.length,
    completed: totalCompletados,
    approved: aprobados,
    reprobados: reprobados,
    enProgreso: enProgreso,
    pendientes: pendientes,
    averageScore: promedioPorcentaje,
    bestScore: Math.max(...modules.map(m => m.porcentaje || 0)),
    totalTimeSpent: 0
  };
};

/**
 * 5. Preparar resultado final
 */
const prepareDashboardResult = (modules, stats, year, userProgress) => {
  const progressPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Módulos próximos (en progreso primero, luego pendientes)
  const nextModules = modules
    .filter(m => m.estado === 'en-progreso' || m.estado === 'pendiente')
    .sort((a, b) => {
      // En progreso primero
      if (a.estado === 'en-progreso' && b.estado !== 'en-progreso') return -1;
      if (b.estado === 'en-progreso' && a.estado !== 'en-progreso') return 1;
      // Luego por orden
      return a.order - b.order;
    })
    .slice(0, 3);

  // Módulos recientes (completados, más recientes primero)
  const recentModules = modules
    .filter(m => m.estado === 'aprobado' || m.estado === 'reprobado')
    .sort((a, b) => b.order - a.order)
    .slice(0, 4);

  return {
    modules: modules,
    nextModules,
    recentModules,
    stats,
    yearProgress: userProgress,
    yearTitle: year === 1 ? 'Primero de Bachillerato' : 'Segundo de Bachillerato',
    canDownloadCertificate: userProgress.resumen?.completado || stats.completed >= modules.length,
    progressPercent,
    rawProgress: userProgress,
    timestamp: new Date().toISOString()
  };
};

/**
 * FUNCIONES AUXILIARES
 */
const getModuleIcon = (order) => {
  const icons = ['💻', '🔧', '⚙️', '📄', '🌐', '👨‍💻', '⚛️', '🔥', '🔌', '🚀', '💼', '🎯'];
  return icons[(order - 1) % icons.length] || '📚';
};

const getDefaultModules = (year) => {
  const defaultModules = {
    1: [
      { id: "1ro_modulo_1", titulo: "Introducción a la Informática", descripcion: "Conceptos básicos de informática", orden: 1, duracionEstimada: 60, dificultad: "básico", año: "1ro", icon: "💻" },
      { id: "1ro_modulo_2", titulo: "Soporte Técnico", descripcion: "Conceptos de soporte técnico", orden: 2, duracionEstimada: 60, dificultad: "básico", año: "1ro", icon: "🔧" },
      { id: "1ro_modulo_3", titulo: "Sistema Operativo", descripcion: "Funciones de sistemas operativos", orden: 3, duracionEstimada: 60, dificultad: "básico", año: "1ro", icon: "⚙️" },
      { id: "1ro_modulo_4", titulo: "Ofimática Básica", descripcion: "Herramientas ofimáticas", orden: 4, duracionEstimada: 60, dificultad: "básico", año: "1ro", icon: "📄" },
      { id: "1ro_modulo_5", titulo: "Internet Seguro", descripcion: "Prácticas seguras en internet", orden: 5, duracionEstimada: 60, dificultad: "básico", año: "1ro", icon: "🌐" },
      { id: "1ro_modulo_6", titulo: "Programación Básica", descripcion: "Fundamentos de programación", orden: 6, duracionEstimada: 60, dificultad: "básico", año: "1ro", icon: "👨‍💻" }
    ],
    2: [
      { id: "2do_modulo_1", titulo: "Algoritmos y Lógica", descripcion: "Fundamentos de algoritmos", orden: 1, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "⚛️" },
      { id: "2do_modulo_2", titulo: "Programación Avanzada", descripcion: "Estructuras avanzadas", orden: 2, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "🔥" },
      { id: "2do_modulo_3", titulo: "Diseño Web", descripcion: "HTML y CSS básico", orden: 3, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "🔌" },
      { id: "2do_modulo_4", titulo: "Seguridad Informática", descripcion: "Protección de sistemas", orden: 4, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "🚀" },
      { id: "2do_modulo_5", titulo: "Bases de Datos", descripcion: "Fundamentos de bases de datos", orden: 5, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "💼" },
      { id: "2do_modulo_6", titulo: "POO", descripcion: "Programación orientada a objetos", orden: 6, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "🎯" },
      { id: "2do_modulo_7", titulo: "Redes", descripcion: "Redes informáticas", orden: 7, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "📡" },
      { id: "2do_modulo_8", titulo: "Pensamiento Computacional", descripcion: "Resolución de problemas", orden: 8, duracionEstimada: 90, dificultad: "intermedio", año: "2do", icon: "🧠" }
    ]
  };

  return defaultModules[year] || defaultModules[1];
};

const getFallbackData = (year) => {
  const modules = getDefaultModules(year);
  const modulesWithStatus = modules.map((module, index) => ({
    ...formatModuleData(module, index + 1, year),
    status: 'pending',
    etiqueta: '📝 PENDIENTE',
    estado: 'pendiente',
    aprobado: false,
    progress: 0,
    porcentaje: 0,
    testInfo: null,
    colorEtiqueta: '#6b7280',
    mostrarBarraProgreso: true
  }));

  const stats = calculateStats(modulesWithStatus);

  return {
    modules: modulesWithStatus,
    nextModules: modulesWithStatus.slice(0, 3),
    recentModules: [],
    stats,
    yearProgress: { testsCompletados: 0, testsAprobados: 0 },
    yearTitle: year === 1 ? 'Primero de Bachillerato' : 'Segundo de Bachillerato',
    canDownloadCertificate: false,
    progressPercent: 0,
    rawProgress: {},
    timestamp: new Date().toISOString(),
    isFallback: true
  };
};

/**
 * Guardar resultado de test
 */
/**
 * Guardar resultado de test - VERSIÓN COMPATIBLE CON TU ESTRUCTURA
 */
/**
 * Guardar resultado de test - VERSIÓN COMPATIBLE CON TU ESTRUCTURA
 */

// Mapeo de módulos para nombres consistentes
/**
 * Guardar resultado de test - VERSIÓN COMPATIBLE CON TU ESTRUCTURA
 */
const saveTestResult = async (userId, year, testId, testData) => {
  try {
    console.log(`💾 Guardando resultado test para usuario ${userId}, año ${year}, módulo ${testId}`);

    if (!userId || !testId) {
      throw new Error("Datos incompletos: usuario o testId no proporcionado");
    }

    const yearKey = `año${year}`;

    // Determinar el nombre del test basado en el módulo
    const testKey = getTestKey(parseInt(testId), testData.moduleTitle);
    console.log('🔑 Clave del test:', testKey);

    // Referencias
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const userRef = doc(db, "users", userId);

    // 1. OBTENER DATOS ACTUALES
    const [progressDoc, userDoc] = await Promise.all([
      getDoc(progressRef),
      getDoc(userRef)
    ]);

    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado en Firebase");
    }

    // Inicializar variables después de obtener documentos
    const userData = userDoc.data();
    const currentProgress = progressDoc.exists() ? progressDoc.data() : null;
    const currentTests = currentProgress?.tests || {};

    // 2. PREPARAR DATOS DEL TEST EN EL FORMATO CORRECTO
    const formattedQuestions = {};
    const totalQuestions = testData.totalPreguntas || testData.puntajeMaximo || 5;
    const userAnswers = testData.respuestas || {};

    // Crear estructura de preguntas
    for (let i = 1; i <= totalQuestions; i++) {
      const userAnswer = userAnswers[i];
      const questionData = testData.resultadosDetallados?.find(r => r.questionId === i);
      const isCorrect = questionData?.isCorrect || (userAnswer === 1);

      formattedQuestions[`q${i}`] = {
        id: `q${i}`,
        idPregunta: `q${i}`,
        idModulo: `modulo${testId}`,
        respuestaUsuario: userAnswer?.toString() || "0",
        respuestaCorrecta: "1",
        esCorrecta: isCorrect,
        puntaje: isCorrect ? 1 : 0
      };
    }

    // Calcular porcentaje
    const correctAnswers = Object.values(formattedQuestions).filter(q => q.esCorrecta).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const approved = percentage >= 70;

    // Obtener slug y nombre del módulo
    const moduleSlug = getModuleSlug(parseInt(testId), testData.moduleTitle);
    const moduleFullName = testData.moduleTitle || getModuleFullName(parseInt(testId));

    // Datos del test
    const newTestData = {
      id: testKey,
      moduloId: `modulo${testId}`,
      moduloNombre: moduleSlug,
      moduloNombreCompleto: moduleFullName,
      totalPreguntas: totalQuestions,
      puntajeObtenido: correctAnswers,
      porcentaje: percentage,
      aprobado: approved,
      preguntas: formattedQuestions,
      fechaCompletado: serverTimestamp()
    };

    console.log('📝 Datos del test preparados:', newTestData);

    // 3. VERIFICAR SI ES UN TEST NUEVO O ACTUALIZACIÓN
    const isNewTest = !currentTests[testKey];
    const wasTestApproved = currentTests[testKey]?.aprobado || false;

    // 4. PREPARAR ACTUALIZACIONES PARA progress/añoX
    let progressUpdate = {};

    // Actualizar tests
    progressUpdate[`tests.${testKey}`] = newTestData;

    // Calcular nuevos contadores
    let testsCompletados = currentProgress?.testsCompletados || 0;
    let testsAprobados = currentProgress?.testsAprobados || 0;
    let totalTests = currentProgress?.totalTests || (year === 1 ? 6 : 8);

    if (isNewTest) {
      testsCompletados += 1;
      if (approved) {
        testsAprobados += 1;
      }
    } else {
      // Si ya existía, actualizar aprobación
      if (wasTestApproved !== approved) {
        if (approved) {
          testsAprobados += 1;
        } else {
          testsAprobados = Math.max(0, testsAprobados - 1);
        }
      }
    }

    progressUpdate.testsCompletados = testsCompletados;
    progressUpdate.testsAprobados = testsAprobados;
    progressUpdate.totalTests = totalTests;

    // Calcular promedios y mejor/peor puntaje
    const allTests = { ...currentTests, [testKey]: newTestData };
    const testPercentages = Object.values(allTests)
      .filter(t => t.porcentaje !== undefined)
      .map(t => t.porcentaje);

    const promedioGeneral = testPercentages.length > 0
      ? Math.round(testPercentages.reduce((sum, p) => sum + p, 0) / testPercentages.length)
      : percentage;

    const mejorPuntaje = testPercentages.length > 0 ? Math.max(...testPercentages) : percentage;
    const peorPuntaje = testPercentages.length > 0 ? Math.min(...testPercentages) : percentage;

    progressUpdate.promedioGeneral = promedioGeneral;
    progressUpdate.mejorPuntaje = mejorPuntaje;
    progressUpdate.peorPuntaje = peorPuntaje;

    // Actualizar resumen
    const resumen = {
      completado: testsCompletados >= totalTests,
      testsCompletados,
      testsAprobados,
      promedioGeneral,
      mejorPuntaje,
      peorPuntaje,
      tiempoTotal: currentProgress?.resumen?.tiempoTotal || 0
    };

    progressUpdate.resumen = resumen;

    // Metadatos
    const now = serverTimestamp();
    progressUpdate.metadata = {
      actualizadoEL: now
    };

    // Si no existe el documento de progreso, crear estructura inicial
    if (!currentProgress) {
      progressUpdate.userId = userId;
      progressUpdate.año = year;
      progressUpdate.metadata.creadoEL = now;
      progressUpdate.fechaCreacion = now;

      // Asegurar valores iniciales
      progressUpdate.testsCompletados = testsCompletados || 0;
      progressUpdate.testsAprobados = testsAprobados || 0;
      progressUpdate.totalTests = totalTests;
      progressUpdate.promedioGeneral = promedioGeneral || 0;
      progressUpdate.mejorPuntaje = mejorPuntaje || 0;
      progressUpdate.peorPuntaje = peorPuntaje || 100;
    }

    // 5. ACTUALIZAR users/progreso/añoX
    const userUpdate = {};
    const userYearProgress = userData.progreso?.[yearKey] || {};

    const totalNiveles = userYearProgress.totalNiveles || (year === 1 ? 6 : 8);
    let nivelesCompletados = userYearProgress.nivelesCompletados || 0;
    let nivelesAprobados = userYearProgress.nivelesAprobados || 0;
    let modulosAprobadosArray = userYearProgress.modulosAprobados || [];

    const moduleNumber = parseInt(testId);

    // Verificar si este módulo ya estaba completado
    const isModuleAlreadyCompleted = moduleNumber <= nivelesCompletados;

    if (!isModuleAlreadyCompleted) {
      // Nuevo módulo completado
      nivelesCompletados = Math.max(nivelesCompletados, moduleNumber);
      if (approved) {
        // Solo agregar si no estaba ya en la lista
        if (!modulosAprobadosArray.includes(moduleNumber)) {
          modulosAprobadosArray.push(moduleNumber);
        }
      }
    } else {
      // Módulo ya existente, verificar cambio en aprobación
      const wasModuleApproved = modulosAprobadosArray.includes(moduleNumber);

      if (wasModuleApproved && !approved) {
        // Pasa de aprobado a reprobado
        modulosAprobadosArray = modulosAprobadosArray.filter(num => num !== moduleNumber);
      } else if (!wasModuleApproved && approved) {
        // Pasa de reprobado a aprobado
        modulosAprobadosArray.push(moduleNumber);
      }
    }

    // Ordenar y limpiar duplicados
    modulosAprobadosArray = [...new Set(modulosAprobadosArray)].sort((a, b) => a - b);
    nivelesAprobados = modulosAprobadosArray.length;

    const completado = nivelesCompletados >= totalNiveles;

    userUpdate[`progreso.${yearKey}`] = {
      ...userYearProgress,
      nivelesCompletados,
      nivelesAprobados,
      modulosAprobados: modulosAprobadosArray,
      promedioPuntaje: promedioGeneral,
      completado,
      totalNiveles,
      ultimaActualizacion: now
    };

    userUpdate.ultimoAcceso = now;

    // 6. EJECUTAR ACTUALIZACIONES
    console.log('🚀 Ejecutando actualizaciones en Firebase...');

    const batch = writeBatch(db);

    if (progressDoc.exists()) {
      batch.update(progressRef, progressUpdate);
    } else {
      // Si no existe, crear documento con todos los campos necesarios
      const initialProgress = {
        userId: userId,
        año: year,
        testsCompletados: testsCompletados || 0,
        testsAprobados: testsAprobados || 0,
        totalTests: totalTests,
        promedioGeneral: promedioGeneral || 0,
        mejorPuntaje: mejorPuntaje || 0,
        peorPuntaje: peorPuntaje || 100,
        tests: {},
        resumen: {
          completado: false,
          testsCompletados: testsCompletados || 0,
          testsAprobados: testsAprobados || 0,
          promedioGeneral: promedioGeneral || 0,
          mejorPuntaje: mejorPuntaje || 0,
          peorPuntaje: peorPuntaje || 100,
          tiempoTotal: 0
        },
        metadata: {
          creadoEL: now,
          actualizadoEL: now
        },
        fechaCreacion: now
      };

      // Combinar con las actualizaciones
      const finalProgress = { ...initialProgress, ...progressUpdate };
      batch.set(progressRef, finalProgress);
    }

    batch.update(userRef, userUpdate);

    await batch.commit();

    console.log(`✅ Test ${testKey} guardado exitosamente`);
    return {
      success: true,
      message: "Resultado guardado exitosamente",
      testKey,
      yearKey,
      data: {
        test: newTestData,
        progress: {
          testsCompletados,
          testsAprobados,
          promedioGeneral
        },
        user: {
          nivelesCompletados,
          nivelesAprobados
        }
      }
    };

  } catch (error) {
    console.error('❌ Error guardando resultado:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.stack
    };
  }
};

/**
 * Función para obtener estadísticas de intentos
 */
export const getTestAttemptStats = async (userId, year) => {
  try {
    const yearKey = `año${year}`;
    const progressRef = doc(db, "users", userId, "progress", yearKey);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return { totalAttempts: 0, averageAttempts: 0, modulesWithRetakes: 0 };
    }

    const progressData = progressDoc.data();
    const tests = progressData.tests || {};

    let totalAttempts = 0;
    let modulesWithRetakes = 0;

    Object.values(tests).forEach(test => {
      const attempts = test.attempts || 1;
      totalAttempts += attempts;
      if (attempts > 1) modulesWithRetakes++;
    });

    const totalModules = Object.keys(tests).length;
    const averageAttempts = totalModules > 0 ? (totalAttempts / totalModules).toFixed(1) : 0;

    return {
      totalAttempts,
      averageAttempts,
      modulesWithRetakes,
      totalModules
    };

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { totalAttempts: 0, averageAttempts: 0, modulesWithRetakes: 0 };
  }
};

const getTestKey = (testId, moduleTitle = '') => {
  const moduleNumber = parseInt(testId);

  // Mapeo directo por número
  const keyMap = {
    1: 'test_intro_001',
    2: 'test_soporte_001',
    3: 'test_so_001',
    4: 'test_ofi_001',
    5: 'test_inter_001',
    6: 'test_prog_001'
  };

  // Si tenemos mapeo directo, usarlo
  if (keyMap[moduleNumber]) {
    return keyMap[moduleNumber];
  }

  // Si no, intentar por título
  if (moduleTitle) {
    const lowerTitle = moduleTitle.toLowerCase();
    if (lowerTitle.includes('introducción') || lowerTitle.includes('intro')) return 'test_intro_001';
    if (lowerTitle.includes('soporte')) return 'test_soporte_001';
    if (lowerTitle.includes('sistema operativo') || lowerTitle.includes('so')) return 'test_so_001';
    if (lowerTitle.includes('ofimática') || lowerTitle.includes('ofi')) return 'test_ofi_001';
    if (lowerTitle.includes('internet')) return 'test_inter_001';
    if (lowerTitle.includes('programación') || lowerTitle.includes('prog')) return 'test_prog_001';
  }

  // Por defecto
  return `test_modulo${moduleNumber}_001`;
};

const getModuleSlug = (testId, moduleTitle = '') => {
  const slugs = {
    1: 'introduccion_informatica',
    2: 'soporte_tecnico',
    3: 'sistema_operativo',
    4: 'ofimatica_basica',
    5: 'internet_seguro',
    6: 'programacion_basica',
    7: 'algoritmos_logica',
    8: 'programacion_media_avanzada',
    9: 'diseno_web_basico',
    10: 'seguridad_informatica',
    11: 'bases_de_datos_basicas',
    12: 'programacion_orientada_objetos',
    13: 'redes_informaticas_basicas',
    14: 'pensamiento_computacional'
  };

  if (slugs[testId]) {
    return slugs[testId];
  }

  if (moduleTitle) {
    return moduleTitle.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '_');
  }

  return `modulo_${testId}`;
};

const getModuleFullName = (testId) => {
  const names = {
    1: 'Introducción a la Informática',
    2: 'Soporte Técnico',
    3: 'Sistema Operativo',
    4: 'Ofimática Básica',
    5: 'Internet Seguro',
    6: 'Programación Básica'
  };
  return names[testId] || `Módulo ${testId}`;
};

// ¡NO OLVIDES EXPORTAR!
export { getDashboardData, saveTestResult };

