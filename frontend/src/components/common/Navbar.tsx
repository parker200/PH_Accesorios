import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { useCart } from '../../contexts/CartContext.js';
import { LogOut, LayoutDashboard, ShieldCheck, ShoppingBag } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
          }}
        >
          <img
            src="/logo-ph.jpg"
            alt="Logo Accesorios PH"
            style={{
              height: '46px',
              width: '46px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <div>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--color-black)',
                display: 'block',
                lineHeight: 1.1
              }}
            >
              ACCESORIOS PH
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--color-gray-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Tecnología & Diseño
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: 'var(--color-black)',
              padding: '6px 12px'
            }}
          >
            Catálogo
          </Link>

          {/* Shopping Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn btn-outline"
            style={{
              position: 'relative',
              padding: '0.5rem 0.9rem',
              fontSize: '0.88rem'
            }}
            title="Ver carrito de pedido"
          >
            <ShoppingBag size={18} />
            <span>Carrito</span>
            {totalItems > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--color-black)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  marginLeft: '2px'
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/admin/dashboard"
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              >
                <LayoutDashboard size={16} />
                <span>Panel Admin</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem' }}
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
            >
              <ShieldCheck size={16} />
              <span>Acceso Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
