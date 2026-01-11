import { auth, db } from '../services/firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp,
  collection,
  writeBatch
} from 'firebase/firestore';

/**
 * Script para crear usuarios demo
 * Ejecutar desde consola del navegador
 */

export const createDemoUsers = async () => {
  try {
    console.log('🚀 Iniciando creación de datos demo...');
    
    // Credenciales demo
    const demoAccounts = [
      {
        email: 'admin@sysscholar.com',
        password: 'Admin123!',
        userData: {
          nombre: 'Administrador Principal',
          usuario: 'admin_sys',
          edad: 35,
          cedula: '1234567890',
          celular: '0991234567',
          año: '1',
          rol: 'admin',
          fechaRegistro: serverTimestamp(),
          penalizado: false,
          motivoPenalizacion: '',
          fotoURL: 'https://ui-avatars.com/api/?name=Admin+Sys&background=30297A&color=fff',
          ultimoAcceso: serverTimestamp(),
          progreso: {
            año1: { completado: true, nivelesCompletados: 5, totalNiveles: 5 },
            año2: { completado: true, nivelesCompletados: 6, totalNiveles: 6 }
          }
        }
      },
      {
        email: 'estudiante@sysscholar.com',
        password: 'Estudiante123!',
        userData: {
          nombre: 'Juan Pérez Demo',
          usuario: 'juan_perez',
          edad: 22,
          cedula: '0987654321',
          celular: '0999876543',
          año: '1',
          rol: 'estudiante',
          fechaRegistro: serverTimestamp(),
          penalizado: false,
          motivoPenalizacion: '',
          fotoURL: 'https://ui-avatars.com/api/?name=Juan+Perez&background=2563eb&color=fff',
          ultimoAcceso: serverTimestamp(),
          progreso: {
            año1: { completado: false, nivelesCompletados: 2, totalNiveles: 5 },
            año2: { completado: false, nivelesCompletados: 0, totalNiveles: 6 }
          }
        }
      }
    ];

    const results = [];

    for (const account of demoAccounts) {
      try {
        console.log(`📧 Creando: ${account.email}`);
        
        // Intentar crear usuario
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          account.email,
          account.password
        );
        
        const userId = userCredential.user.uid;
        
        // Guardar datos en Firestore
        await setDoc(doc(db, 'users', userId), {
          ...account.userData,
          uid: userId,
          email: account.email
        });
        
        // Cerrar sesión después de crear
        await signOut(auth);
        
        results.push({ email: account.email, success: true, message: '✅ Creado exitosamente' });
        console.log(`✅ ${account.email} creado`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️ ${account.email} ya existe, actualizando datos...`);
          
          try {
            // Iniciar sesión para actualizar
            const loginCredential = await signInWithEmailAndPassword(
              auth,
              account.email,
              account.password
            );
            
            const userId = loginCredential.user.uid;
            
            // Actualizar datos en Firestore
            await setDoc(doc(db, 'users', userId), {
              ...account.userData,
              uid: userId,
              email: account.email
            }, { merge: true });
            
            await signOut(auth);
            results.push({ email: account.email, success: true, message: '✅ Actualizado exitosamente' });
            console.log(`✅ ${account.email} actualizado`);
            
          } catch (loginError) {
            results.push({ email: account.email, success: false, message: `❌ Error: ${loginError.message}` });
            console.error(`❌ Error con ${account.email}:`, loginError.message);
          }
        } else {
          results.push({ email: account.email, success: false, message: `❌ Error: ${error.message}` });
          console.error(`❌ Error creando ${account.email}:`, error.message);
        }
      }
    }

    return results;

  } catch (error) {
    console.error('❌ Error general:', error);
    return [{ success: false, message: `❌ Error general: ${error.message}` }];
  }
};

/**
 * Crear módulos demo
 */
export const createDemoModules = async () => {
  try {
    console.log('📚 Creando módulos demo...');
    
    const batch = writeBatch(db);
    const nivelesCollection = collection(db, 'levels');
    
    // Módulos año 1
    const nivelesAño1 = [
      {
        levelId: 'año1_nivel1',
        año: '1',
        orden: 1,
        titulo: 'Programación Básica',
        descripcion: 'Introducción a algoritmos, variables y lógica de programación',
        contenido: '<h2>Programación Básica</h2><p>Conceptos fundamentales...</p>',
        duracionEstimada: 120,
        dificultad: 'básico',
        prerequisitos: [],
        bloqueado: false,
        test: {
          habilitado: true,
          preguntas: [
            {
              id: 1,
              pregunta: '¿Qué es una variable?',
              tipo: 'opcion_multiple',
              opciones: ['Constante', 'Contenedor de datos', 'Función', 'Error'],
              respuestaCorrecta: 1,
              puntos: 20,
              tiempoEstimado: 30
            },
            {
              id: 2,
              pregunta: 'JavaScript es un lenguaje de programación',
              tipo: 'verdadero_falso',
              opciones: ['Verdadero', 'Falso'],
              respuestaCorrecta: 0,
              puntos: 20,
              tiempoEstimado: 20
            }
          ],
          puntajeMinimo: 70,
          tiempoLimite: 600,
          intentosPermitidos: 3
        },
        metadata: {
          creadoPor: 'system',
          fechaCreacion: serverTimestamp()
        }
      },
      {
        levelId: 'año1_nivel2',
        año: '1',
        orden: 2,
        titulo: 'HTML/CSS Fundamentos',
        descripcion: 'Estructura web y estilos básicos',
        contenido: '<h2>HTML y CSS</h2><p>Fundamentos de desarrollo web...</p>',
        duracionEstimada: 180,
        dificultad: 'básico',
        prerequisitos: ['año1_nivel1'],
        bloqueado: true,
        test: { habilitado: true, preguntas: [], puntajeMinimo: 75, tiempoLimite: 600 },
        metadata: { creadoPor: 'system', fechaCreacion: serverTimestamp() }
      }
    ];

    // Añadir niveles al batch
    nivelesAño1.forEach(nivel => {
      const nivelRef = doc(nivelesCollection, nivel.levelId);
      batch.set(nivelRef, nivel);
    });

    // Ejecutar batch
    await batch.commit();
    console.log('✅ Módulos demo creados');
    return { success: true };

  } catch (error) {
    console.error('❌ Error creando módulos:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Función principal
 */
export const initializeDemoData = async () => {
  console.log('='.repeat(50));
  console.log('🚀 SYS SCHOLAR - CREACIÓN DE DATOS DEMO');
  console.log('='.repeat(50));
  
  const usersResult = await createDemoUsers();
  const modulesResult = await createDemoModules();
  
  console.log('\n📊 RESULTADOS:');
  usersResult.forEach(result => {
    console.log(`📧 ${result.email}: ${result.message}`);
  });
  
  console.log(`📚 Módulos: ${modulesResult.success ? '✅ Creados' : '❌ Error'}`);
  
  console.log('\n🔑 CREDENCIALES DEMO:');
  console.log('   👨‍🏫 Admin: admin@sysscholar.com / Admin123!');
  console.log('   👨‍🎓 Estudiante: estudiante@sysscholar.com / Estudiante123!');
  console.log('='.repeat(50));
  
  return { users: usersResult, modules: modulesResult };
};

// Hacer disponible en consola del navegador
if (typeof window !== 'undefined') {
  window.initializeDemoData = initializeDemoData;
  window.createDemoModules = createDemoModules;
  window.createDemoUsers = createDemoUsers;
}