import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext.js';
import { formatBs } from '../../utils/formatters.js';
import { STORE_CONFIG } from '../../config/store.js';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  MapPin,
  User,
  Phone,
  FileText,
  Send
} from 'lucide-react';

export const CartModal: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    // Generate formatted message for WhatsApp
    const orderLines = items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.name} - ${formatBs(it.price * it.quantity)} (${formatBs(it.price)} c/u)`
      )
      .join('\n');

    const messageText =
`🛍️ *NUEVO PEDIDO - ACCESORIOS PH*
---------------------------------------
👤 *Cliente:* ${customerName.trim()}
📍 *Dirección de entrega:* ${customerAddress.trim()}
${customerPhone.trim() ? `📞 *Teléfono:* ${customerPhone.trim()}\n` : ''}${customerNotes.trim() ? `📝 *Notas:* ${customerNotes.trim()}\n` : ''}---------------------------------------
📦 *PRODUCTOS:*
${orderLines}

💰 *TOTAL A PAGAR: ${formatBs(totalPrice)}*
---------------------------------------
¡Hola! He completado mi pedido en la web. ¿Tienen disponibilidad para coordinar la entrega?`;

    const encoded = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Reset and close
    clearCart();
    setStep('cart');
    setIsCartOpen(false);
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
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-gray-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-black)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {step === 'cart' ? 'Tu Carrito de Pedido' : 'Datos para la Entrega'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-muted)' }}>
                {step === 'cart' ? `${totalItems} artículo(s)` : 'Paso 2 de 2 • Envío directo por WhatsApp'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-white)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ShoppingBag
                size={48}
                color="var(--color-gray-muted)"
                style={{ margin: '0 auto 1rem', opacity: 0.5 }}
              />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Tu carrito está vacío</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-muted)', marginBottom: '1.5rem' }}>
                Explora el catálogo y agrega los accesorios que necesites.
              </p>
              <button onClick={() => setIsCartOpen(false)} className="btn btn-primary">
                Ver Catálogo
              </button>
            </div>
          ) : step === 'cart' ? (
            /* Step 1: Cart Items List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-gray-border)',
                    backgroundColor: 'var(--color-white)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-bg-light)',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {it.coverImage ? (
                        <img
                          src={it.coverImage}
                          alt={it.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}
                        >
                          PH
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-gray-muted)',
                          textTransform: 'uppercase',
                          fontWeight: 600
                        }}
                      >
                        {it.categoryName}
                      </span>
                      <h4
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: 'var(--color-black)',
                          lineHeight: 1.2
                        }}
                      >
                        {it.name}
                      </h4>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '2px' }}>
                        {formatBs(it.price)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--color-gray-border)',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 6px',
                        backgroundColor: 'var(--color-bg-light)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(it.id, it.quantity - 1)}
                        style={{ padding: '4px', display: 'flex' }}
                        title="Disminuir"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          minWidth: '24px',
                          textAlign: 'center'
                        }}
                      >
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        style={{ padding: '4px', display: 'flex' }}
                        title="Aumentar"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      style={{ color: 'var(--color-danger)', padding: '6px' }}
                      title="Eliminar del carrito"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Step 2: Checkout Form */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit}>
              <div
                style={{
                  backgroundColor: 'var(--color-sky-blue-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--color-black)',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--color-sky-blue)'
                }}
              >
                Completa tus datos para enviar tu pedido directamente al WhatsApp oficial <strong>({STORE_CONFIG.whatsappDisplayNumber})</strong>.
              </div>

              <div className="form-group">
                <label className="form-label">Nombre y Apellido *</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="var(--color-gray-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Gutiérrez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección de Entrega / Ciudad *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={16}
                    color="var(--color-gray-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Calle Murillo #450, Edif. Los Pinos, Dpto 3B"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono / Celular de Contacto (Opcional)</label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="var(--color-gray-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="tel"
                    placeholder="Ej. 75220978"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Notas Adicionales (Opcional)</label>
                <div style={{ position: 'relative' }}>
                  <FileText
                    size={16}
                    color="var(--color-gray-muted)"
                    style={{ position: 'absolute', left: '12px', top: '14px' }}
                  />
                  <textarea
                    rows={2}
                    placeholder="Ej. Dejar en recepción, color de funda negro, etc."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="form-textarea"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer with totals and action */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--color-gray-border)',
              backgroundColor: 'var(--color-bg-light)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '1rem'
              }}
            >
              <span style={{ fontSize: '0.92rem', color: 'var(--color-gray-muted)', fontWeight: 600 }}>
                Total a Pagar ({totalItems} items):
              </span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-black)' }}>
                {formatBs(totalPrice)}
              </span>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  justifyContent: 'center'
                }}
              >
                <span>Continuar con el Pedido</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="btn btn-outline"
                  style={{ padding: '0.85rem 1.25rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Atrás</span>
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="btn btn-whatsapp"
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={16} />
                  <span>Confirmar y Enviar a WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
