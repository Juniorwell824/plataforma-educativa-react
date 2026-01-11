// src/services/modulesData.js
// Datos estructurados de todos los módulos (1ro de Bachillerato)

export const modulesData = {
  1: {
    id: 1,
    title: "Introducción a la Informática",
    description: "Conceptos básicos de informática y sus componentes",
    theory: [
      {
        title: "¿Qué es la Informática?",
        content: "La informática es la ciencia que estudia el tratamiento automático de la información mediante el uso de computadoras, programas y redes."
      },
      {
        title: "Componentes principales",
        content: "Hardware (partes físicas) y Software (programas e instrucciones)"
      },
      {
        title: "Historia de la informática",
        content: "Desde las primeras máquinas de cálculo hasta las computadoras modernas"
      },
      {
        title: "Soporte Técnico",
        content: "Área encargada del mantenimiento y solución de problemas tecnológicos."
      },
      {
        title: "Sistema Operativo",
        content: "Software principal que permite interactuar con la computadora."
      }
    ],
    questions: [
      {
        id: 1,
        question: "¿Cuál es la función del soporte técnico?",
        options: [
          { id: 0, text: "Navegar en internet" },
          { id: 1, text: "Resolver problemas técnicos", correct: true },
          { id: 2, text: "Crear documentos" }
        ]
      },
      {
        id: 2,
        question: "¿Qué es un sistema operativo?",
        options: [
          { id: 0, text: "Un hardware" },
          { id: 1, text: "Software que controla el equipo", correct: true },
          { id: 2, text: "Un virus" }
        ]
      },
      {
        id: 3,
        question: "¿Cuál es un programa de ofimática?",
        options: [
          { id: 0, text: "Linux" },
          { id: 1, text: "Word", correct: true },
          { id: 2, text: "BIOS" }
        ]
      },
      {
        id: 4,
        question: "¿Qué práctica es segura en internet?",
        options: [
          { id: 0, text: "Compartir contraseñas" },
          { id: 1, text: "Proteger datos personales", correct: true },
          { id: 2, text: "Abrir enlaces desconocidos" }
        ]
      },
      {
        id: 5,
        question: "¿Qué se aprende en programación básica?",
        options: [
          { id: 0, text: "Reparar computadoras" },
          { id: 1, text: "Lógica y estructuras de código", correct: true },
          { id: 2, text: "Usar Word" }
        ]
      }
    ],
    totalQuestions: 5,
    passingScore: 70 // 70% para aprobar
  },
  2: {
    id: 2,
    title: "Soporte Técnico",
    description: "Mantenimiento y solución de problemas tecnológicos",
    theory: [
      {
        title: "¿Qué es el Soporte Técnico?",
        content: "Área encargada del mantenimiento y solución de problemas tecnológicos."
      },
      {
        title: "Características principales",
        content: "Diagnóstico de fallas, mantenimiento preventivo, instalación de software, soporte presencial y remoto"
      },
      {
        title: "Historia",
        content: "Surgió con la expansión de las computadoras en empresas y centros educativos."
      },
      {
        title: "Funciones",
        content: "Evitar interrupciones en el trabajo, prolongar la vida útil de los equipos, garantizar la seguridad de la información"
      },
      {
        title: "Aspectos importantes",
        content: "Diagnóstico correcto, seguridad informática, atención al usuario"
      }
    ],
    questions: [
      {
        id: 1,
        question: "¿Cuál es la principal función del soporte técnico?",
        options: [
          { id: 0, text: "Crear programas informáticos" },
          { id: 1, text: "Solucionar problemas tecnológicos", correct: true },
          { id: 2, text: "Diseñar páginas web" }
        ]
      },
      {
        id: 2,
        question: "¿Qué tipo de mantenimiento busca prevenir fallas futuras?",
        options: [
          { id: 0, text: "Mantenimiento correctivo" },
          { id: 1, text: "Mantenimiento preventivo", correct: true },
          { id: 2, text: "Mantenimiento estético" }
        ]
      },
      {
        id: 3,
        question: "¿Cuál de las siguientes acciones corresponde al soporte técnico?",
        options: [
          { id: 0, text: "Programar videojuegos" },
          { id: 1, text: "Instalar y actualizar software", correct: true },
          { id: 2, text: "Diseñar logos" }
        ]
      },
      {
        id: 4,
        question: "¿Por qué es importante la seguridad en el soporte técnico?",
        options: [
          { id: 0, text: "Para hacer más lento el sistema" },
          { id: 1, text: "Para proteger la información del usuario", correct: true },
          { id: 2, text: "Para eliminar programas útiles" }
        ]
      },
      {
        id: 5,
        question: "¿Qué habilidad es fundamental en un técnico de soporte?",
        options: [
          { id: 0, text: "Dibujar bien" },
          { id: 1, text: "Analizar y resolver problemas", correct: true },
          { id: 2, text: "Jugar videojuegos" }
        ]
      }
    ],
    totalQuestions: 5,
    passingScore: 70
  },
  3: {
    id: 3,
    title: "Sistema Operativo",
    description: "Software principal que permite interactuar con la computadora",
    theory: [
      {
        title: "¿Qué es un Sistema Operativo?",
        content: "Es el software principal de una computadora. Se encarga de administrar el hardware, ejecutar programas y permitir la interacción entre el usuario y el equipo."
      },
      {
        title: "Historia",
        content: "Los primeros sistemas operativos surgieron en la década de 1950 para facilitar el uso de grandes computadoras."
      },
      {
        title: "Funciones principales",
        content: "Gestión de memoria, multitarea, seguridad y permisos, ejecución de aplicaciones"
      },
      {
        title: "Tipos de Sistemas Operativos",
        content: "Windows, Linux, macOS, Android, iOS"
      },
      {
        title: "Importancia",
        content: "Sin un sistema operativo, una computadora no puede funcionar correctamente."
      }
    ],
    questions: [
      {
        id: 1,
        question: "¿Cuál es la función principal de un sistema operativo?",
        options: [
          { id: 0, text: "Crear documentos" },
          { id: 1, text: "Administrar hardware y software", correct: true },
          { id: 2, text: "Conectarse a internet" }
        ]
      },
      {
        id: 2,
        question: "¿Cuál fue una de las primeras funciones de los sistemas operativos?",
        options: [
          { id: 0, text: "Juegos en línea" },
          { id: 1, text: "Procesamiento por lotes", correct: true },
          { id: 2, text: "Redes sociales" }
        ]
      },
      {
        id: 3,
        question: "¿Qué característica permite ejecutar varios programas al mismo tiempo?",
        options: [
          { id: 0, text: "Interfaz gráfica" },
          { id: 1, text: "Multitarea", correct: true },
          { id: 2, text: "Antivirus" }
        ]
      },
      {
        id: 4,
        question: "¿Qué elemento protege la información del usuario?",
        options: [
          { id: 0, text: "El monitor" },
          { id: 1, text: "Seguridad y permisos", correct: true },
          { id: 2, text: "La memoria RAM" }
        ]
      },
      {
        id: 5,
        question: "¿Qué controla la gestión de procesos?",
        options: [
          { id: 0, text: "El diseño del escritorio" },
          { id: 1, text: "La ejecución de programas y recursos", correct: true },
          { id: 2, text: "El acceso a internet" }
        ]
      }
    ],
    totalQuestions: 5,
    passingScore: 70
  },
  4: {
    id: 4,
    title: "Ofimática Básica",
    description: "Herramientas informáticas para tareas académicas y profesionales",
    theory: [
      {
        title: "¿Qué es la Ofimática?",
        content: "Es el conjunto de herramientas informáticas que permiten crear, editar, organizar y almacenar información de forma digital."
      },
      {
        title: "Historia",
        content: "Surge en la década de 1980 con la aparición de las computadoras personales."
      },
      {
        title: "Características",
        content: "Automatiza tareas repetitivas, facilita el almacenamiento de información, permite edición rápida, integra texto, números y gráficos"
      },
      {
        title: "Herramientas principales",
        content: "Procesadores de texto (Word), Hojas de cálculo (Excel), Presentaciones (PowerPoint)"
      },
      {
        title: "Importancia",
        content: "Desarrolla habilidades digitales esenciales para la educación superior y el mundo laboral."
      }
    ],
    questions: [
      {
        id: 1,
        question: "¿Cuál fue el principal motivo del surgimiento de la ofimática?",
        options: [
          { id: 0, text: "Crear videojuegos" },
          { id: 1, text: "Automatizar tareas administrativas", correct: true },
          { id: 2, text: "Reemplazar internet" }
        ]
      },
      {
        id: 2,
        question: "¿Qué característica diferencia a la ofimática del trabajo manual?",
        options: [
          { id: 0, text: "Uso exclusivo de papel" },
          { id: 1, text: "Rapidez y facilidad de edición", correct: true },
          { id: 2, text: "Falta de organización" }
        ]
      },
      {
        id: 3,
        question: "¿Cuál de estas tareas se realiza mejor con una hoja de cálculo?",
        options: [
          { id: 0, text: "Redactar cartas" },
          { id: 1, text: "Analizar datos numéricos", correct: true },
          { id: 2, text: "Diseñar sistemas operativos" }
        ]
      },
      {
        id: 4,
        question: "¿Por qué la ofimática es importante en la educación?",
        options: [
          { id: 0, text: "Solo sirve para trabajar" },
          { id: 1, text: "Desarrolla habilidades digitales", correct: true },
          { id: 2, text: "Elimina el estudio" }
        ]
      },
      {
        id: 5,
        question: "¿Cuál es una consecuencia del mal uso de herramientas ofimáticas?",
        options: [
          { id: 0, text: "Mayor productividad" },
          { id: 1, text: "Pérdida de información", correct: true },
          { id: 2, text: "Mejor organización" }
        ]
      }
    ],
    totalQuestions: 5,
    passingScore: 70
  },
  5: {
    id: 5,
    title: "Internet Seguro",
    description: "Uso responsable y protegido de las tecnologías digitales",
    theory: [
      {
        title: "¿Qué es Internet Seguro?",
        content: "Se refiere al uso responsable, consciente y protegido de las tecnologías digitales, para prevenir riesgos como fraudes, robo de información y pérdida de privacidad."
      },
      {
        title: "Historia del Internet",
        content: "Surgió en los años 60 como un proyecto militar (ARPANET) y se convirtió en una red global."
      },
      {
        title: "Características",
        content: "Comunicación global e inmediata, acceso a información ilimitada, interacción social y educativa, riesgos digitales si no se usa correctamente"
      },
      {
        title: "Privacidad Digital",
        content: "Protege la información personal como contraseñas, fotos y datos bancarios."
      },
      {
        title: "Huella Digital",
        content: "Es el rastro de información que dejamos en internet. Todo lo que publicamos puede permanecer en la red."
      }
    ],
    questions: [
      {
        id: 1,
        question: "¿Por qué la huella digital puede afectar el futuro de una persona?",
        options: [
          { id: 0, text: "Porque se borra automáticamente" },
          { id: 1, text: "Porque la información publicada puede permanecer en internet", correct: true },
          { id: 2, text: "Porque solo la ve el dueño de la cuenta" }
        ]
      },
      {
        id: 2,
        question: "¿Cuál es una acción correcta para proteger la privacidad?",
        options: [
          { id: 0, text: "Publicar datos personales" },
          { id: 1, text: "Usar contraseñas seguras y no compartirlas", correct: true },
          { id: 2, text: "Aceptar a cualquier persona en redes sociales" }
        ]
      },
      {
        id: 3,
        question: "¿Qué riesgo existe al abrir enlaces desconocidos?",
        options: [
          { id: 0, text: "Mejora el rendimiento del equipo" },
          { id: 1, text: "Robo de información o virus", correct: true },
          { id: 2, text: "No existe ningún riesgo" }
        ]
      },
      {
        id: 4,
        question: "¿Cuál fue el objetivo inicial del internet?",
        options: [
          { id: 0, text: "Redes sociales" },
          { id: 1, text: "Comunicación segura entre computadoras", correct: true },
          { id: 2, text: "Juegos en línea" }
        ]
      },
      {
        id: 5,
        question: "¿Qué demuestra un uso responsable de internet?",
        options: [
          { id: 0, text: "Compartir todo sin pensar" },
          { id: 1, text: "Cuidar la información personal y respetar a los demás", correct: true },
          { id: 2, text: "Usarlo solo para entretenimiento" }
        ]
      }
    ],
    totalQuestions: 5,
    passingScore: 70
  },
  6: {
    id: 6,
    title: "Programación Básica",
    description: "Creación de instrucciones para que una computadora realice tareas",
    theory: [
      {
        title: "¿Qué es la Programación Básica?",
        content: "Es el conjunto de conocimientos iniciales que permiten crear instrucciones para que una computadora realice tareas específicas de forma lógica y ordenada."
      },
      {
        title: "Historia",
        content: "Nació a mediados del siglo XX con las primeras computadoras. Ada Lovelace fue considerada la primera programadora."
      },
      {
        title: "¿Para qué se utiliza?",
        content: "Desarrollo de aplicaciones, creación de videojuegos, automatización de tareas"
      },
      {
        title: "¿Dónde se implementa?",
        content: "Educación, empresas y negocios, ciencia y tecnología"
      },
      {
        title: "Importancia",
        content: "Desarrolla el pensamiento lógico y la capacidad de resolver problemas de manera estructurada. Prepara para carreras tecnológicas."
      }
    ],
    questions: [
      {
        id: 1,
        question: "¿Cuál es el objetivo principal de la programación?",
        options: [
          { id: 0, text: "Usar la computadora" },
          { id: 1, text: "Dar instrucciones para resolver problemas", correct: true },
          { id: 2, text: "Reparar hardware" }
        ]
      },
      {
        id: 2,
        question: "¿Qué es un algoritmo?",
        options: [
          { id: 0, text: "Un programa dañado" },
          { id: 1, text: "Conjunto ordenado de pasos", correct: true },
          { id: 2, text: "Un dispositivo físico" }
        ]
      },
      {
        id: 3,
        question: "¿Cuál lenguaje facilitó el aprendizaje inicial de programación?",
        options: [
          { id: 0, text: "BIOS" },
          { id: 1, text: "BASIC", correct: true },
          { id: 2, text: "HTML" }
        ]
      },
      {
        id: 4,
        question: "¿Qué habilidad desarrolla la programación?",
        options: [
          { id: 0, text: "Memorización" },
          { id: 1, text: "Pensamiento lógico", correct: true },
          { id: 2, text: "Uso del teclado" }
        ]
      },
      {
        id: 5,
        question: "¿Cuál es un proyecto posible con programación básica?",
        options: [
          { id: 0, text: "Sistema operativo" },
          { id: 1, text: "Calculadora", correct: true },
          { id: 2, text: "Red de internet" }
        ]
      },
      {
        id: 6,
        question: "¿Por qué es importante aprender programación hoy?",
        options: [
          { id: 0, text: "Para usar redes sociales" },
          { id: 1, text: "Para adaptarse al mundo tecnológico", correct: true },
          { id: 2, text: "Para escribir más rápido" }
        ]
      }
    ],
    totalQuestions: 6,
    passingScore: 70
  }
};

// Función para obtener datos de un módulo específico
export const getModuleData = (moduleId) => {
  const id = parseInt(moduleId);
  return modulesData[id] || modulesData[1]; // Si no existe, retorna módulo 1
};

// Función para calcular resultados
export const calculateResults = (moduleId, answers) => {
  const module = getModuleData(moduleId);
  let score = 0;
  const results = [];
  
  module.questions.forEach(question => {
    const userAnswer = answers[question.id];
    const correctOption = question.options.find(opt => opt.correct);
    const isCorrect = userAnswer === correctOption?.id;
    
    if (isCorrect) score++;
    
    results.push({
      questionId: question.id,
      userAnswer,
      correctAnswer: correctOption?.id,
      isCorrect,
      questionText: question.question,
      options: question.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.correct,
        isSelected: userAnswer === opt.id
      }))
    });
  });
  
  const percentage = (score / module.totalQuestions) * 100;
  const approved = percentage >= module.passingScore;
  
  return {
    score,
    total: module.totalQuestions,
    percentage,
    approved,
    results,
    passingScore: module.passingScore,
    moduleTitle: module.title
  };
};

// Función para verificar si un módulo está completado
export const isModuleCompleted = (moduleId, userProgress) => {
  if (!userProgress || !userProgress.tests) return false;
  
  const testEntries = Object.entries(userProgress.tests);
  for (const [testKey, testData] of testEntries) {
    // Buscar por ID de módulo
    if (testData.moduloId && testData.moduloId === `modulo${moduleId}`) {
      return true;
    }
    // Buscar por número de test
    if (testData.testId === moduleId) {
      return true;
    }
  }
  
  return false;
};