import React from 'react';
import { HashRouter  as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Layouts
import AuthLayout from './components/common/AuthLayout';
import MainLayout from './components/common/MainLayout';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ResetPassword from './pages/public/ResetPassword';

// Student Pages
import YearSelection from './pages/student/YearSelection';
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import ModuleViewer from './components/student/ModuleViewer';
import HTMLModuleViewer from './components/student/HTMLModuleViewer';


// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminEditStudent from './pages/admin/AdminEditStudent';
import AdminStats from './pages/admin/AdminStats';
import AdminLayout from './components/admin/AdminLayout';

// Styles
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Componente para redirigir según autenticación
const AuthRedirect = () => {
  return <Navigate to="/login" />;
};

// Componente para redirigir después de login
const PostLoginRedirect = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Redirigiendo...</span>
        </div>
        <p className="mt-3">Redirigiendo a tu panel...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta raíz - Redirige según autenticación */}
          <Route path="/" element={<AuthRedirect />} />

          {/* Páginas públicas (sin navbar/footer) */}
          <Route path="/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />

          <Route path="/register" element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          } />

          <Route path="/reset-password" element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          } />

          {/* Ruta de redirección después de login */}
          <Route path="/redirect" element={<PostLoginRedirect />} />

          {/* Páginas protegidas para estudiantes */}
          <Route path="/select-year" element={
            <PrivateRoute>
              <MainLayout>
                <YearSelection />
              </MainLayout>
            </PrivateRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Ruta para visualizar módulos HTML - ¡AHORA PROTEGIDA! */}
          <Route path="/module/:moduleId" element={
            <PrivateRoute>
              <ModuleViewer />
            </PrivateRoute>
          } />
          <Route path="/module/:moduleNumber" element={
            <PrivateRoute>
              <HTMLModuleViewer />
            </PrivateRoute>
          } />

          <Route path="/test-modulo" element={
            <div>
              <h1>Ruta de Prueba SIN PrivateRoute</h1>
              <p>Si ves esto, el problema NO es PrivateRoute</p>
              <a href="/modulos/modulo1.html">Probar módulo</a>
            </div>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </PrivateRoute>
          } />

          {/* Páginas protegidas para admin - NUEVO ROUTING */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/:id" element={<AdminEditStudent />} />
            <Route path="stats" element={<AdminStats />} />
          </Route>

          {/* 404 - Redirige a login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;