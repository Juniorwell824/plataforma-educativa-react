// components/admin/AdminLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/admin.css';

const AdminLayout = () => {
  const { userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>📊 Admin Panel</h2>
          <div className="admin-info">
            <span className="admin-badge">Admin</span>
            <small>{userData?.email}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin/dashboard">
                <i className="bi bi-speedometer2"></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/students">
                <i className="bi bi-people"></i>
                Estudiantes
              </Link>
            </li>
            <li>
              <Link to="/admin/stats">
                <i className="bi bi-bar-chart"></i>
                Estadísticas
              </Link>
            </li>
            <li className="divider"></li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <i className="bi bi-box-arrow-right"></i>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;