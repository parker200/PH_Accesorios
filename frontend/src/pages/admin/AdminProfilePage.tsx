import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { api } from '../../services/api.js';
import { User, KeyRound } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Profile Data Form
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      await api.updateProfile({
        username,
        email: email || undefined
      });
      await refreshUser();
      showToast('Perfil actualizado correctamente', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error actualizando perfil', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('La nueva contraseña y la confirmación no coinciden', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.changePassword({
        currentPassword,
        newPassword
      });
      showToast('Contraseña cambiada exitosamente', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.message || 'Error cambiando contraseña', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mi Perfil de Administrador</h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-muted)' }}>
          Gestiona tu nombre de usuario, correo y actualiza tus credenciales de acceso
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} color="var(--color-black)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Información de la Cuenta</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-muted)' }}>
                Rol actual: <strong>{user?.role}</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Nombre de Usuario *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Correo Electrónico (Opcional)</label>
              <input
                type="email"
                placeholder="admin@accesoriosph.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn btn-primary"
            >
              {isUpdatingProfile ? 'Guardando...' : 'Actualizar Información'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <KeyRound size={20} color="var(--color-black)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Cambiar Contraseña</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-muted)' }}>
                Ingresa tu contraseña actual para confirmar tu identidad antes de cambiarla
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Contraseña Actual *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div className="form-group">
                <label className="form-label">Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn btn-primary"
            >
              {isChangingPassword ? 'Cambiando...' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
