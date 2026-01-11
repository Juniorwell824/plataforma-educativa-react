// src/services/adminService.js
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase/config';

export const adminService = {
  // Obtener todos los estudiantes - SIN consulta compuesta
  async getAllStudents() {
    try {
      console.log('🔄 Obteniendo todos los usuarios...');
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const students = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userData = {
          id: doc.id,
          nombre: data.nombre || 'Sin nombre',
          email: data.email || 'Sin email',
          usuario: data.usuario || '',
          cedula: data.cedula || '',
          celular: data.celular || '',
          edad: data.edad || '',
          año: data.año || '1',
          rol: data.rol || 'estudiante',
          penalizado: data.penalizado || false,
          motivoPenalizacion: data.motivoPenalizacion || '',
          fechaRegistro: data.fechaRegistro || null,
          ultimoAcceso: data.ultimoAcceso || null,
          progreso: data.progreso || {},
          // Agregar campos que ves en tu backup
          añoSeleccionado: data.añoSeleccionado || '1',
          ultimoAccesoSeconds: data.ultimoAcceso?._seconds || null
        };
        
        // Filtrar solo estudiantes (excluir admin)
        if (userData.rol === 'estudiante') {
          students.push(userData);
        }
      });
      
      // Ordenar alfabéticamente por nombre LOCALMENTE
      students.sort((a, b) => {
        const nameA = a.nombre.toLowerCase();
        const nameB = b.nombre.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      console.log(`✅ Encontrados ${students.length} estudiantes`);
      return students;
      
    } catch (error) {
      console.error('❌ Error obteniendo estudiantes:', error);
      throw error;
    }
  },

  // Obtener estadísticas reales
  async getStats() {
    try {
      const students = await this.getAllStudents();
      
      const stats = {
        totalStudents: students.length,
        activeStudents: 0,
        studentsByYear: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        completionRate: 0,
        newThisMonth: 0,
        byStatus: {active: 0, penalized: 0}
      };
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      students.forEach(student => {
        // Contar por año
        const year = parseInt(student.año) || 1;
        if (year >= 1 && year <= 5) {
          stats.studentsByYear[year] = (stats.studentsByYear[year] || 0) + 1;
        }
        
        // Contar activos/inactivos
        if (student.penalizado) {
          stats.byStatus.penalized++;
        } else {
          stats.byStatus.active++;
          stats.activeStudents++;
        }
        
        // Contar nuevos este mes
        if (student.fechaRegistro) {
          const regDate = this.parseFirebaseTimestamp(student.fechaRegistro);
          if (regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear) {
            stats.newThisMonth++;
          }
        }
      });
      
      // Calcular tasa de actividad
      stats.completionRate = stats.totalStudents > 0 ? 
        Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0;
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      // Datos de respaldo si falla
      return {
        totalStudents: 0,
        activeStudents: 0,
        studentsByYear: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        completionRate: 0,
        newThisMonth: 0,
        byStatus: {active: 0, penalized: 0}
      };
    }
  },

  // Convertir timestamp de Firebase
  parseFirebaseTimestamp(timestamp) {
    if (!timestamp) return new Date();
    
    try {
      // Si es un objeto Timestamp de Firebase
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
      }
      
      // Si tiene estructura {_seconds, _nanoseconds}
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000);
      }
      
      // Si es string ISO
      if (typeof timestamp === 'string') {
        return new Date(timestamp);
      }
      
      // Si es objeto Date
      if (timestamp.toDate) {
        return timestamp.toDate();
      }
    } catch (error) {
      console.warn('Error parseando timestamp:', timestamp);
    }
    
    return new Date();
  },

  // Formatear fecha para mostrar
  formatDate(timestamp) {
    try {
      if (!timestamp) return 'Nunca';
      
      const date = this.parseFirebaseTimestamp(timestamp);
      
      // Si la fecha es inválida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Formato relativo
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return `Hace ${diffMinutes} min`;
        }
        return `Hace ${diffHours} horas`;
      } else if (diffDays === 1) {
        return 'Ayer';
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
      }
      
      // Formato completo
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', timestamp, error);
      return 'Fecha inválida';
    }
  },

  // Obtener estudiantes recientes
  async getRecentStudents(limit = 5) {
    try {
      const students = await this.getAllStudents();
      
      // Ordenar por último acceso (más reciente primero)
      return students
        .sort((a, b) => {
          const dateA = this.parseFirebaseTimestamp(a.ultimoAcceso || a.fechaRegistro);
          const dateB = this.parseFirebaseTimestamp(b.ultimoAcceso || b.fechaRegistro);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit)
        .map(student => ({
          ...student,
          ultimoAccesoFormatted: this.formatDate(student.ultimoAcceso)
        }));
    } catch (error) {
      console.error('Error obteniendo estudiantes recientes:', error);
      return [];
    }
  },

  // Buscar estudiantes
  async searchStudents(searchTerm = '', yearFilter = 'all', statusFilter = 'all') {
    try {
      const students = await this.getAllStudents();
      
      return students.filter(student => {
        // Filtrar por búsqueda
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matches = 
            (student.nombre && student.nombre.toLowerCase().includes(term)) ||
            (student.email && student.email.toLowerCase().includes(term)) ||
            (student.usuario && student.usuario.toLowerCase().includes(term)) ||
            (student.cedula && student.cedula.includes(searchTerm));
          
          if (!matches) return false;
        }
        
        // Filtrar por año
        if (yearFilter !== 'all' && student.año !== yearFilter) {
          return false;
        }
        
        // Filtrar por estado
        if (statusFilter === 'active' && student.penalizado) {
          return false;
        }
        if (statusFilter === 'penalized' && !student.penalizado) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error buscando estudiantes:', error);
      return [];
    }
  },

  // Obtener estudiante por ID
  async getStudentById(id) {
    try {
      const studentRef = doc(db, 'users', id);
      const studentDoc = await getDoc(studentRef);
      
      if (!studentDoc.exists()) {
        throw new Error('Estudiante no encontrado');
      }
      
      const data = studentDoc.data();
      
      return {
        id: studentDoc.id,
        nombre: data.nombre || '',
        email: data.email || '',
        usuario: data.usuario || '',
        cedula: data.cedula || '',
        celular: data.celular || '',
        edad: data.edad || '',
        año: data.año || '1',
        rol: data.rol || 'estudiante',
        penalizado: data.penalizado || false,
        motivoPenalizacion: data.motivoPenalizacion || '',
        fechaRegistro: data.fechaRegistro || null,
        ultimoAcceso: data.ultimoAcceso || null,
        progreso: data.progreso || {}
      };
    } catch (error) {
      console.error('Error obteniendo estudiante:', error);
      throw error;
    }
  },

  // Actualizar estudiante
  async updateStudent(id, updates) {
    try {
      const studentRef = doc(db, 'users', id);
      
      // Preparar actualizaciones (excluir campos sensibles)
      const safeUpdates = { ...updates };
      delete safeUpdates.id;
      delete safeUpdates.email;
      delete safeUpdates.rol;
      
      await updateDoc(studentRef, {
        ...safeUpdates,
        ultimoAcceso: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando estudiante:', error);
      throw error;
    }
  }
};