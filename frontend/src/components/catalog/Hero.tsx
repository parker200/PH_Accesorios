import React from 'react';
import { Sparkles, ArrowDown } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section
      style={{
        paddingTop: '5rem',
        paddingBottom: '4.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Subtle pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-sky-blue-subtle)',
            border: '1px solid var(--color-sky-blue)',
            marginBottom: '1.75rem'
          }}
        >
          <Sparkles size={15} color="var(--color-black)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-black)' }}>
            Nueva Colección • Accesorios PH
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: '-0.035em',
            marginBottom: '1.25rem',
            color: 'var(--color-black)'
          }}
        >
          Diseño, durabilidad y precisión para tu dispositivo.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            color: 'var(--color-gray-muted)',
            lineHeight: 1.55
          }}
        >
          Explora nuestra selección cuidada de auriculares, cargadores de alta velocidad, 
          cables ultra reforzados y fundas con diseño premium.
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={onExploreClick}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}
          >
            <span>Ver Catálogo</span>
            <ArrowDown size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
