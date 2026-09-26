import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--color-black)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
        Página no encontrada
      </h2>
      <p style={{ color: 'var(--color-gray-muted)', maxWidth: '420px', marginBottom: '2rem' }}>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        <span>Volver al Catálogo</span>
      </Link>
    </div>
  );
};
