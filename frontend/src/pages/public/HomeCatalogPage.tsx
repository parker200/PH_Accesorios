import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { Hero } from '../../components/catalog/Hero.js';
import { ProductCard, Product } from '../../components/catalog/ProductCard.js';
import { ProductModal } from '../../components/catalog/ProductModal.js';
import { Search, Sparkles, Filter, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

export const HomeCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const catalogSectionRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);
      setCategories(catsRes.data || []);
      setProducts(prodsRes.data || []);
    } catch (error) {
      console.error('Error fetching catalog data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter products by selected category and search input
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategoryId === 'all' || prod.category.id === selectedCategoryId;
    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const discountedCount = products.filter((p) => p.pricing.hasDiscount).length;

  return (
    <div>
      {/* Hero Header */}
      <Hero onExploreClick={scrollToCatalog} />

      {/* Catalog Main Section */}
      <section
        ref={catalogSectionRef}
        className="container"
        style={{ paddingBottom: '6rem', scrollMarginTop: '90px' }}
      >
        {/* Promotion Highlight Ribbon if discounts exist */}
        {discountedCount > 0 && (
          <div
            style={{
              backgroundColor: 'var(--color-sky-blue-subtle)',
              border: '1px solid var(--color-sky-blue)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-sky-blue)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-black)'
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-black)' }}>
                  Promociones Activas Disponibles
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-muted)' }}>
                  Aprovecha hasta un 25% de descuento en artículos seleccionados por tiempo limitado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Top: Search and Results Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                flex: '1',
                minWidth: '280px',
                maxWidth: '450px'
              }}
            >
              <Search
                size={18}
                color="var(--color-gray-muted)"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                placeholder="Buscar por auriculares, cables, cargadores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: '42px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-white)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-gray-muted)'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-muted)' }}>
              Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
            </div>
          </div>

          {/* Bottom: Dynamic Category Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '6px',
              scrollbarWidth: 'none'
            }}
          >
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`btn ${selectedCategoryId === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem' }}
            >
              Todos ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.category.id === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem' }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '6rem 0',
              color: 'var(--color-gray-muted)'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid var(--color-gray-border)',
                borderTopColor: 'var(--color-black)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p style={{ marginTop: '1rem', fontSize: '0.95rem' }}>Cargando catálogo...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 1.5rem',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <Filter size={40} color="var(--color-gray-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              No se encontraron productos
            </h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Intenta cambiar los términos de búsqueda o selecciona otra categoría.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setSearchQuery('');
              }}
              className="btn btn-secondary"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="catalog-products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
