import { Video, Sparkles, Eye, ShoppingBag } from 'lucide-react';
import { formatBs, getMediaUrl } from '../../utils/formatters.js';
import { useCart } from '../../contexts/CartContext.js';

interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  isCover: boolean;
}

interface ProductPricing {
  originalPrice: number;
  finalPrice: number;
  discountPercentage: number;
  hasDiscount: boolean;
  activePromotion?: {
    name: string;
    type: string;
    discountPercentage: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: {
    id: string;
    name: string;
  };
  media: ProductMedia[];
  pricing: ProductPricing;
}

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addItem } = useCart();

  const coverImage =
    product.media.find((m) => m.isCover && m.type === 'image') ||
    product.media.find((m) => m.type === 'image');

  const hasVideo = product.media.some((m) => m.type === 'video');

  return (
    <div
      onClick={() => onOpenDetail(product)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(product);
        }
      }}
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Media Container */}
      <div
        style={{
          position: 'relative',
          paddingTop: '80%', // 4:3 Aspect ratio
          backgroundColor: '#F7F7F8',
          overflow: 'hidden'
        }}
      >
        {coverImage ? (
          <img
            src={getMediaUrl(coverImage.url)}
            alt={product.name}
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gray-muted)',
              fontSize: '0.85rem'
            }}
          >
            Sin imagen
          </div>
        )}

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}
        >
          {product.pricing.hasDiscount ? (
            <span
              className="badge badge-discount"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontWeight: 800
              }}
            >
              <Sparkles size={12} />
              {product.pricing.discountPercentage}% OFF
            </span>
          ) : (
            <span />
          )}

          {hasVideo && (
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(20, 15, 12, 0.75)',
                color: '#fff',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Video size={12} />
              Video 5s
            </span>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between'
        }}
      >
        <div>
          {/* Category */}
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-gray-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            {product.category.name}
          </span>

          {/* Product Name */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-black)',
              marginBottom: '0.5rem',
              lineHeight: 1.3
            }}
          >
            {product.name}
          </h3>

          {/* Description snippet */}
          {product.description && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-gray-muted)',
                lineHeight: 1.45,
                marginBottom: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing and Action */}
        <div style={{ marginTop: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '1rem'
            }}
          >
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-black)'
              }}
            >
              {formatBs(product.pricing.finalPrice)}
            </span>

            {product.pricing.hasDiscount && (
              <span
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-gray-muted)',
                  textDecoration: 'line-through'
                }}
              >
                {formatBs(product.pricing.originalPrice)}
              </span>
            )}
          </div>

          {/* Actions: Add to Cart & View Detail */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                fontSize: '0.86rem',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                addItem(product, 1);
              }}
              title="Añadir al carrito"
            >
              <ShoppingBag size={16} />
              <span>Añadir al Carrito</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.65rem 0.8rem' }}
              title="Ver detalle del producto"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product);
              }}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
