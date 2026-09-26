import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-black)',
        color: 'var(--color-bg-light)',
        marginTop: 'auto',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Value Propositions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '3rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Shield size={24} color="var(--color-sky-blue)" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>
                Garantía y Calidad
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.82rem' }}>
                Accesorios rigurosamente probados para alto rendimiento y durabilidad.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <CheckCircle size={24} color="var(--color-sky-blue)" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>
                Precios Claros & Promociones
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.82rem' }}>
                Descuentos transparentes calculados en tiempo real.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Truck size={24} color="var(--color-sky-blue)" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>
                Pedidos Directos por WhatsApp
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.82rem' }}>
                Atención personalizada e inmediata sin intermediarios.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo-ph.jpg"
              alt="Accesorios PH"
              style={{
                height: '36px',
                width: '36px',
                objectFit: 'contain',
                borderRadius: '6px'
              }}
            />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              ACCESORIOS PH
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            © {new Date().getFullYear()} Accesorios PH. Todos los derechos reservados.
          </p>

          <Link
            to="/admin/login"
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-sky-blue)',
              textDecoration: 'none'
            }}
          >
            Portal de Administración
          </Link>
        </div>
      </div>
    </footer>
  );
};
