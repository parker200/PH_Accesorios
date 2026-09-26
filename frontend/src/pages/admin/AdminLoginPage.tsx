import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPassword123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login({ username, password });
      showToast('Bienvenido al Panel de Administración', 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Credenciales incorrectas');
      showToast(err.message || 'Error de autenticación', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-light)',
        padding: '1.5rem'
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/"
          className="btn btn-outline"
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Volver a la tienda</span>
        </Link>
      </div>

      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--color-white)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center'
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/logo-ph.jpg"
            alt="Logo Accesorios PH"
            style={{ width: '64px', height: '64px', borderRadius: '12px' }}
          />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Panel Accesorios PH
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-gray-muted)', marginBottom: '2rem' }}>
          Ingresa tus credenciales para administrar la tienda
        </p>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                color="var(--color-gray-muted)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Nombre de usuario"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--color-gray-muted)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
          >
            <ShieldCheck size={18} />
            <span>{isLoading ? 'Iniciando sesión...' : 'Entrar al Panel'}</span>
          </button>
        </form>

        {/* Credentials helper banner */}
        <div
          style={{
            marginTop: '2rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: 'var(--color-gray-muted)',
            textAlign: 'left'
          }}
        >
          <strong>Credenciales por defecto:</strong>
          <br />
          Usuario: <code>admin</code>
          <br />
          Contraseña: <code>AdminPassword123!</code>
        </div>
      </div>
    </div>
  );
};
