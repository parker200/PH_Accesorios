import React from 'react';
import { MessageCircle } from 'lucide-react';
import { formatBs } from '../../utils/formatters.js';
import { STORE_CONFIG } from '../../config/store.js';

interface WhatsAppButtonProps {
  productName: string;
  price: number;
  productId?: string;
  phoneNumber?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  iconOnly?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  price,
  productId,
  phoneNumber = STORE_CONFIG.whatsappNumber,
  className = '',
  style,
  label = 'Pedir por WhatsApp',
  iconOnly = false
}) => {
  const formattedPrice = formatBs(price);

  const message = encodeURIComponent(
    `¡Hola Accesorios PH! Me interesa el producto "${productName}"${
      productId ? ` (Ref: ${productId.slice(0, 8)})` : ''
    } por ${formattedPrice}. ¿Tienen stock disponible?`
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-whatsapp ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
      title={label}
    >
      <MessageCircle size={16} />
      {!iconOnly && <span>{label}</span>}
    </a>
  );
};
