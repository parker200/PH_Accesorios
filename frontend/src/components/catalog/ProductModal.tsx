import React, { useState, useEffect } from 'react';
import { Product } from './ProductCard.js';
import { WhatsAppButton } from '../common/WhatsAppButton.js';
import { formatBs, getMediaUrl } from '../../utils/formatters.js';
import { useCart } from '../../contexts/CartContext.js';
import {
  X,
  Sparkles,
  Video,
  Volume2,
  VolumeX,
  ShieldCheck,
  Check,
  ShoppingBag,
  Plus,
  Minus
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setSelectedMediaIndex(0);
    setQuantity(1);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const currentMedia = product.media[selectedMediaIndex] || product.media[0];

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(20, 15, 12, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            backgroundColor: 'var(--color-bg-light)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-black)',
            boxShadow: 'var(--shadow-subtle)'
          }}
          aria-label="Cerrar detalle"
        >
          <X size={20} />
        </button>

        {/* Media Preview Column */}
        <div
          style={{
            backgroundColor: '#F8F9FA',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <video
                    src={getMediaUrl(currentMedia.url)}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="btn"
                      style={{
                        backgroundColor: 'rgba(20, 15, 12, 0.7)',
                        color: '#fff',
                        padding: '6px',
                        borderRadius: '50%'
                      }}
                      title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'rgba(20, 15, 12, 0.7)',
                        color: '#fff',
                        fontSize: '0.72rem'
                      }}
                    >
                      Bucle 5s
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={getMediaUrl(currentMedia.url)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              )
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gray-muted)'
                }}
              >
                Sin imagen
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {product.media.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                maxWidth: '100%',
                padding: '4px'
              }}
            >
              {product.media.map((med, idx) => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMediaIndex(idx)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border:
                      selectedMediaIndex === idx
                        ? '2px solid var(--color-black)'
                        : '1px solid var(--color-gray-border)',
                    position: 'relative',
                    flexShrink: 0
                  }}
                >
                  {med.type === 'video' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'var(--color-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}
                    >
                      <Video size={20} />
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(med.url)}
                      alt={`Miniatura ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Column */}
        <div
          style={{
            padding: '2.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '0.75rem'
              }}
            >
              <span className="badge badge-category">{product.category.name}</span>
              {product.pricing.hasDiscount && (
                <span className="badge badge-discount">
                  <Sparkles size={12} />
                  {product.pricing.discountPercentage}% OFF -{' '}
                  {product.pricing.activePromotion?.name || 'Promoción activa'}
                </span>
              )}
            </div>

            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--color-black)',
                marginBottom: '1rem',
                lineHeight: 1.2
              }}
            >
              {product.name}
            </h2>

            {/* Price Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-light)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}
            >
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-black)'
                }}
              >
                {formatBs(product.pricing.finalPrice)}
              </span>

              {product.pricing.hasDiscount && (
                <div>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      color: 'var(--color-gray-muted)',
                      textDecoration: 'line-through',
                      marginRight: '8px'
                    }}
                  >
                    {formatBs(product.pricing.originalPrice)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-black)'
                    }}
                  >
                    (Ahorras {formatBs(product.pricing.originalPrice - product.pricing.finalPrice)})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '0.5rem',
                  color: 'var(--color-black)'
                }}
              >
                Descripción del producto
              </h4>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--color-gray-muted)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line'
                }}
              >
                {product.description || 'Sin descripción detallada.'}
              </p>
            </div>

            {/* Quality specs */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--color-black)',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--color-success)" />
                <span>Garantía de calidad garantizada Accesorios PH</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>Compatibilidad verificada y entrega inmediata</span>
              </div>
            </div>
          </div>

          {/* Action Row: Quantity + Add to Cart + Direct WhatsApp */}
          <div>
            {/* Quantity Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '1rem'
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cantidad:</span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-gray-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 8px',
                  backgroundColor: 'var(--color-bg-light)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '4px' }}
                >
                  <Minus size={15} />
                </button>
                <span
                  style={{
                    minWidth: '28px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '4px' }}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  justifyContent: 'center'
                }}
              >
                <ShoppingBag size={18} />
                <span>Añadir {quantity > 1 ? `(${quantity})` : ''} al Carrito</span>
              </button>

              <WhatsAppButton
                productName={product.name}
                price={product.pricing.finalPrice * quantity}
                productId={product.id}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  justifyContent: 'center'
                }}
                label={quantity > 1 ? `Comprar ${quantity} por WhatsApp` : 'Comprar Directo por WhatsApp'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
