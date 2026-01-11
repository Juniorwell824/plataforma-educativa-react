import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (user) => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      console.log('=== DEBUG ===');
      console.log('Usuario autenticado UID:', user.uid);
      console.log('Usuario autenticado email:', user.email);

      // 1. Cargar solo los datos principales del usuario
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      console.log('Documento encontrado?:', userDoc.exists());

      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('Datos cargados:', data);
        // ... resto del código

        // Guardar datos del usuario
        setUserData(data);
        // Si es admin (por email o rol), no hacer nada más
        if (data.rol === 'admin') {
          console.log('✅ Usuario identificado como administrador');
          // Los admin NO necesitan estructura de estudiante
        } else {
          // Para estudiantes, verificar/crear estructura si falta
          if (!data.progreso) {
            // Crear estructura para estudiante si no existe
            const progressStructure = {
              año1: {
                completado: false,
                nivelesAprobados: 0,
                nivelesCompletados: 0,
                promedioPuntaje: 0,
                totalNiveles: 6
              },
              año2: {
                completado: false,
                nivelesAprobados: 0,
                nivelesCompletados: 0,
                promedioPuntaje: 0,
                totalNiveles: 8
              }
            };

            await updateDoc(userRef, {
              progreso: progressStructure
            });

            setUserData({ ...data, progreso: progressStructure });
          }
        }

      } else {
        console.log('ERROR: No existe documento con UID:', user.uid);
        console.log('Verifica que exista en colección "users"');

        // Crear documento automáticamente si no existe
        const newUserData = {
          uid: user.uid,
          email: user.email,
          nombre: user.email?.split('@')[0] || 'Estudiante',
          rol: 'estudiante',
          fechaRegistro: new Date().toISOString(),
          ultimoAcceso: new Date().toISOString(),
          progreso: {
            año1: {
              completado: false,
              nivelesCompletados: 0,
              totalNiveles: 6
            },
            año2: {
              completado: false,
              nivelesCompletados: 0,
              totalNiveles: 8
            }
          }
        };

        // Crear documento automáticamente
        await setDoc(userRef, newUserData);
        console.log('Documento creado automáticamente');
        setUserData(newUserData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }

  const updateUserData = async (updates) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        ultimoAcceso: serverTimestamp()
      });

      // Actualizar el estado local
      setUserData(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error("Error actualizando datos del usuario:", error);
      return false;
    }
  };


  // Observador de autenticación
  useEffect(() => {
    console.log('👤 AuthProvider: Inicializando...');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('👤 Firebase Auth State Changed:', {
        hasUser: !!user,
        email: user?.email,
        uid: user?.uid,
        timestamp: new Date().toISOString()
      });

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Función de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await loadUserData(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de registro
  /*   const register = async (email, password, userData) => {
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
        // Crear documento del usuario en Firestore
        const userDoc = {
          ...userData,
          uid: userCredential.user.uid,
          email: email,
          rol: 'estudiante',
          fechaRegistro: new Date().toISOString(),
          ultimoAcceso: new Date().toISOString(),
          progreso: {
            año1: {
              completado: false,
              nivelesAprobados: 0,
              nivelesCompletados: 0,
              promedioPuntaje: 0,
              totalNiveles: 6
            },
            año2: {
              completado: false,
              nivelesAprobados: 0,
              nivelesCompletados: 0,
              promedioPuntaje: 0,
              totalNiveles: 8
            }
          }
        };
  
        // Guardar en Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
  
        setUserData(userDoc);
        return { success: true, user: userCredential.user };
      } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    }; */

  // Función para crear la estructura completa de progreso
  const createCompleteProgressStructure = (userId, year) => {
    const currentTimestamp = {
      _seconds: Math.floor(Date.now() / 1000),
      _nanoseconds: 0
    };

    return {
      // Documento principal en "users" colección
      mainUserData: {
        nombre: '',
        usuario: '',
        edad: 0,
        cedula: '',
        celular: '',
        año: year.toString(),
        rol: 'estudiante',
        penalizado: false,
        motivoPenalizacion: '',
        uid: userId,
        email: '',
        fechaRegistro: new Date().toISOString(),
        añoSeleccionado: year.toString(),
        ultimoAcceso: currentTimestamp,
        progreso: {
          año2: {
            completado: false,
            nivelesAprobados: 0,
            nivelesCompletados: 0,
            promedioPuntaje: 0,
            totalNiveles: 8
          },
          año1: {
            nivelesCompletados: 0,
            promedioPuntaje: 0,
            completado: false,
            totalNiveles: 6,
            ultimaActualizacion: currentTimestamp,
            nivelesAprobados: 0
          }
        }
      },

      // Subcolección "progress" - documento año1
      progressYear1: {
        userId: userId,
        totalTests: 6,
        mejorPuntaje: 0,
        peorPuntaje: 0,
        metadata: {
          actualizadoEL: currentTimestamp
        },
        tests: {},
        porcentaje: 0,
        promedioGeneral: 0,
        testsCompletados: 0,
        resumen: {
          completado: false,
          testsCompletados: 0,
          testsAprobados: 0,
          promedioGeneral: 0,
          mejorPuntaje: 0,
          peorPuntaje: 100, // Nota: en el JSON aparece como 100 inicialmente
          tiempoTotal: 0
        },
        testsAprobados: 0
      },

      // Subcolección "progress" - documento año2
      progressYear2: {
        userId: userId,
        año: 2,
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
          creadoEl: currentTimestamp,
          actualizadoEl: currentTimestamp
        },
        fechaCreacion: currentTimestamp
      }
    };
  };

  // Función de registro modificada
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      console.log('Iniciando registro para:', email);

      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      console.log('Usuario Auth creado. UID:', userId);

      // 2. Crear estructura completa
      const year = parseInt(userData.anio) || 1;
      const structure = createCompleteProgressStructure(userId, year);

      // 3. Completar datos del usuario
      const mainUserData = {
        ...structure.mainUserData,
        nombre: userData.nombre,
        usuario: userData.usuario,
        edad: userData.edad,
        cedula: userData.cedula,
        celular: userData.celular,
        año: year.toString(),
        email: email,
        añoSeleccionado: year.toString()
      };

      // 4. Guardar documento principal en colección "users"
      await setDoc(doc(db, 'users', userId), mainUserData);
      console.log('✅ Documento principal creado en colección "users"');

      // 5. Crear subcolección "progress" con documentos año1 y año2
      const progressCollectionRef = collection(db, 'users', userId, 'progress');

      // Documento para año1
      await setDoc(doc(progressCollectionRef, 'año1'), {
        ...structure.progressYear1,
        userId: userId
      });
      console.log('✅ Documento año1 creado en subcolección progress');

      // Documento para año2
      await setDoc(doc(progressCollectionRef, 'año2'), {
        ...structure.progressYear2,
        userId: userId
      });
      console.log('✅ Documento año2 creado en subcolección progress');

      // 6. Cargar datos del usuario recién creado
      setCurrentUser(userCredential.user);
      setUserData(mainUserData);

      return {
        success: true,
        user: userCredential.user,
        message: 'Usuario registrado exitosamente con estructura completa'
      };

    } catch (error) {
      console.error('❌ Error en registro:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error en reset password:', error);
      return { success: false, error: error.message };
    }
  };



  return (
    <AuthContext.Provider value={{
      currentUser,
      userData,
      loading,
      login,
      register,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);