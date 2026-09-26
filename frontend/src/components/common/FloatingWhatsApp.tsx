import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { STORE_CONFIG } from '../../config/store.js';

export const FloatingWhatsApp: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const encodedMessage = encodeURIComponent(STORE_CONFIG.defaultInquiryMessage);
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMessage}`;

  return (
    <aside
      aria-label="Atención al cliente por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 990,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {/* Tooltip / Label */}
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--color-white)',
          color: 'var(--color-black)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-hover)',
          fontSize: '0.84rem',
          fontWeight: 700,
          border: '1px solid var(--color-gray-border)',
          pointerEvents: 'none',
          display: isHovered ? 'block' : 'none',
          whiteSpace: 'nowrap'
        }}
      >
        Requiero información de productos
      </div>

      {/* Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-black)',
          color: 'var(--color-white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(20, 15, 12, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)'
        }}
        title="Consultar al administrador por WhatsApp (+591 60871527)"
      >
        <MessageCircle size={26} color="var(--color-white)" />
      </a>
    </aside>
  );
};
