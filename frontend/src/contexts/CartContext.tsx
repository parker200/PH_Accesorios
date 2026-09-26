import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  coverImage?: string;
  categoryName: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: {
    id: string;
    name: string;
    pricing: {
      finalPrice: number;
      originalPrice: number;
      hasDiscount: boolean;
    };
    category: { name: string };
    media: { url: string; isCover?: boolean; type: string }[];
  }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ph_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastItem, setToastItem] = useState<{ name: string; quantity: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ph_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  const addItem = (product: any, quantity = 1, openModal = false) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      const cover =
        product.media?.find((m: any) => m.isCover && m.type === 'image')?.url ||
        product.media?.find((m: any) => m.type === 'image')?.url ||
        '';

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.pricing?.finalPrice || product.price,
          originalPrice: product.pricing?.originalPrice || product.price,
          hasDiscount: !!product.pricing?.hasDiscount,
          coverImage: cover,
          categoryName: product.category?.name || 'Accesorio',
          quantity
        }
      ];
    });

    if (openModal) {
      setIsCartOpen(true);
    } else {
      setToastItem({ name: product.name, quantity });
      setTimeout(() => {
        setToastItem(null);
      }, 3000);
    }
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}

      {/* Floating Feedback Toast when an item is added */}
      {toastItem && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 24px rgba(20, 15, 12, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1500,
            maxWidth: '90vw'
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            ✓ Añadido ({toastItem.quantity}x): <strong>{toastItem.name}</strong>
          </span>
          <button
            onClick={() => {
              setToastItem(null);
              setIsCartOpen(true);
            }}
            className="btn btn-accent"
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            Ver Carrito
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
