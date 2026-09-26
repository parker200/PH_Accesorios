import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  LayoutDashboard,
  Package,
  Tags,
  Percent,
  User,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-light)'
        }}
      >
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: 'var(--color-bg-light)'
        }}
      >
        <ShieldAlert size={48} color="var(--color-danger)" />
        <h2>Acceso Restringido</h2>
        <p>Debes iniciar sesión con una cuenta autorizada para acceder al panel.</p>
        <button onClick={() => navigate('/admin/login')} className="btn btn-primary">
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Productos' },
    { to: '/admin/categories', icon: Tags, label: 'Categorías' },
    { to: '/admin/promotions', icon: Percent, label: 'Promociones' },
    { to: '/admin/profile', icon: User, label: 'Mi Perfil' }
  ];

  return (
    <div className="admin-layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Mobile Top Bar (visible only on <= 768px) */}
      <header className="admin-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo-ph.jpg"
            alt="Logo"
            style={{ width: '32px', height: '32px', borderRadius: '6px' }}
          />
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.1 }}>
              ACCESORIOS PH
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-gray-muted)' }}>
              Panel Admin
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="btn btn-outline"
          style={{ padding: '0.45rem', borderRadius: '8px' }}
          aria-label="Abrir menú"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`admin-sidebar-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: 'var(--color-white)',
          borderRight: '1px solid var(--color-gray-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}
      >
        {/* Brand header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-gray-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo-ph.jpg"
              alt="Logo"
              style={{ width: '38px', height: '38px', borderRadius: '8px' }}
            />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.1 }}>
                ACCESORIOS PH
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-gray-muted)',
                  fontWeight: 600
                }}
              >
                Panel de Control
              </span>
            </div>
          </div>

          {/* Close button inside drawer for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="admin-mobile-bar"
            style={{
              padding: '4px',
              color: 'var(--color-gray-muted)',
              border: 'none',
              background: 'none'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav
          style={{
            flex: 1,
            padding: '1.25rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `btn ${isActive ? 'btn-primary' : ''}`
                }
                style={({ isActive }) => ({
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'var(--color-black)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-black)'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Profile & Shop Link */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--color-gray-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <Link
            to="/"
            target="_blank"
            className="btn btn-outline"
            style={{
              fontSize: '0.82rem',
              padding: '0.5rem 0.8rem',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <ExternalLink size={15} />
            <span>Ver Tienda Pública</span>
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.25rem'
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-black)'
                }}
              >
                {user?.username}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-sky-blue)',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                color: 'var(--color-danger)',
                padding: '6px',
                borderRadius: '6px'
              }}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
