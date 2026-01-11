// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebase/config";

export const authService = {
  // ========== REGISTRO ==========
  /*   async register(userData) {
      try {
        console.log("Registrando usuario:", userData);
        
        // 1. Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.correo,
          userData.password
        );
        
        const user = userCredential.user;
        console.log("Usuario creado en Auth:", user.uid);
        
        // 2. Preparar datos para Firestore
        const userProfile = {
          uid: user.uid,
          email: userData.correo,
          nombre: userData.nombre,
          usuario: userData.usuario,
          edad: parseInt(userData.edad),
          cedula: userData.cedula,
          celular: userData.celular,
          año: userData.anio,
          rol: "estudiante", // Por defecto
          fechaRegistro: serverTimestamp(),
          penalizado: false,
          progreso: {
            año1: { 
              completado: false, 
              nivelesCompletados: 0,
              totalNiveles: 5,
              fechaInicio: null,
              fechaFin: null
            },
            año2: { 
              completado: false, 
              nivelesCompletados: 0,
              totalNiveles: 6,
              fechaInicio: null,
              fechaFin: null
            }
          }
        };
        
        // 3. Guardar en Firestore
        await setDoc(doc(db, "users", user.uid), userProfile);
        console.log("Usuario guardado en Firestore");
        
        return { 
          success: true, 
          user: userProfile,
          message: "Usuario registrado exitosamente" 
        };
        
      } catch (error) {
        console.error("Error en registro:", error);
        return { 
          success: false, 
          error: error.message,
          code: error.code 
        };
      }
    }, */
  // En tu función register de authService.js, modifica:
  async register(userData) {
    try {
      console.log("Registrando usuario:", userData);

      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.correo,
        userData.password
      );

      const user = userCredential.user;
      console.log("Usuario creado en Auth:", user.uid);

      // 2. Preparar datos para Firestore
      const userProfile = {
        uid: user.uid,
        email: userData.correo,
        nombre: userData.nombre,
        usuario: userData.usuario,
        edad: parseInt(userData.edad),
        cedula: userData.cedula,
        celular: userData.celular,
        año: userData.anio || "1", // Año por defecto
        rol: "estudiante",
        fechaRegistro: serverTimestamp(),
        penalizado: false,
        ultimoAcceso: serverTimestamp(),
        // Resumen del progreso en el documento principal
        progreso: {
          año1: {
            completado: false,
            nivelesCompletados: 0,
            nivelesAprobados: 0,
            promedioPuntaje: 0,
            totalNiveles: 6,
            ultimoTestCompletado: null,
            fechaUltimoTest: null
          },
          año2: {
            completado: false,
            nivelesCompletados: 0,
            nivelesAprobados: 0,
            promedioPuntaje: 0,
            totalNiveles: 8,
            ultimoTestCompletado: null,
            fechaUltimoTest: null
          }
        }
      };

      // 3. Guardar documento principal del usuario
      await setDoc(doc(db, "users", user.uid), userProfile);
      console.log("Usuario guardado en Firestore");

      // 4. Crear subcolección "progress" con documentos iniciales para cada año
      await this.initializeStudentProgress(user.uid);

      return {
        success: true,
        user: userProfile,
        message: "Usuario registrado exitosamente"
      };

    } catch (error) {
      console.error("Error en registro:", error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // ========== FUNCIÓN PARA INICIALIZAR PROGRESO ==========
  async initializeStudentProgress(userId) {
    try {
      const batch = writeBatch(db);

      // Crear documento para año 1
      const progressYear1Ref = doc(collection(db, "users", userId, "progress"));
      const progressYear1 = {
        userId: userId,
        año: 1,
        fechaCreacion: serverTimestamp(),
        totalTests: 6,
        tests: {}, // Objeto vacío que se irá llenando
        resumen: {
          completado: false,
          testsCompletados: 0,
          testsAprobados: 0,
          promedioGeneral: 0,
          mejorPuntaje: 0,
          peorPuntaje: 0,
          tiempoTotal: 0 // en minutos
        },
        metadata: {
          creadoEl: serverTimestamp(),
          actualizadoEl: serverTimestamp()
        }
      };
      batch.set(progressYear1Ref, progressYear1);

      // Crear documento para año 2
      const progressYear2Ref = doc(collection(db, "users", userId, "progress"));
      const progressYear2 = {
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
          peorPuntaje: 0,
          tiempoTotal: 0
        },
        metadata: {
          creadoEl: serverTimestamp(),
          actualizadoEl: serverTimestamp()
        }
      };
      batch.set(progressYear2Ref, progressYear2);

      await batch.commit();
      console.log("Subcolección 'progress' inicializada para usuario:", userId);
      return true;

    } catch (error) {
      console.error("Error inicializando progreso:", error);
      throw error;
    }
  },
  
  // ========== LOGIN ==========
  async login(email, password) {
    try {
      console.log("Intentando login:", email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener datos del usuario de Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        throw new Error("Usuario no encontrado en la base de datos");
      }

      const userData = userDoc.data();

      // Verificar si está penalizado
      if (userData.penalizado) {
        return {
          success: false,
          error: "Usuario penalizado. Contacta al administrador."
        };
      }

      console.log("Login exitoso:", userData.rol);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          ...userData
        },
        message: "Login exitoso"
      };

    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
        code: error.code
      };
    }
  },

  // ========== LOGOUT ==========
  async logout() {
    try {
      await signOut(auth);
      return { success: true, message: "Sesión cerrada" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== RESET PASSWORD ==========
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Correo de recuperación enviado" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ========== OBSERVADOR DE AUTENTICACIÓN ==========
  onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener datos adicionales de Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          callback({ ...user, ...userDoc.data() });
        } else {
          callback(user);
        }
      } else {
        callback(null);
      }
    });
  },

  // ========== OBTENER USUARIO ACTUAL ==========
  async getCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    return userDoc.exists() ? { ...user, ...userDoc.data() } : user;
  },

  // ========== MENSAJES DE ERROR AMIGABLES ==========
  getErrorMessage(errorCode) {
    const messages = {
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El correo ya está registrado',
      'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres)',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
    };

    return messages[errorCode] || 'Error desconocido. Intenta nuevamente.';
  }
};