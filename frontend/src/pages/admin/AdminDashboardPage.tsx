import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Package,
  Tags,
  Percent,
  Plus,
  ArrowRight
} from 'lucide-react';
import { formatBs } from '../../utils/formatters.js';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalPromotions: 0,
    promotionsActive: 0
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [prodsRes, catsRes, promosRes] = await Promise.all([
          api.getProducts({ limit: 5 }),
          api.getCategories(true),
          api.getPromotions()
        ]);

        const prods = prodsRes.data || [];
        const cats = catsRes.data || [];
        const promos = promosRes.data || [];

        const now = new Date();
        const activePromos = promos.filter(
          (p: any) => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now
        );

        setStats({
          totalProducts: prodsRes.pagination?.total || prods.length,
          totalCategories: cats.length,
          totalPromotions: promos.length,
          promotionsActive: activePromos.length
        });

        setRecentProducts(prods.slice(0, 5));
      } catch (error) {
        console.error('Error cargando estadísticas del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      label: 'Productos en Catálogo',
      value: stats.totalProducts,
      icon: Package,
      link: '/admin/products',
      color: 'var(--color-black)'
    },
    {
      label: 'Categorías Dinámicas',
      value: stats.totalCategories,
      icon: Tags,
      link: '/admin/categories',
      color: 'var(--color-black)'
    },
    {
      label: 'Promociones Vigentes',
      value: stats.promotionsActive,
      icon: Percent,
      link: '/admin/promotions',
      color: 'var(--color-sky-blue)'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Resumen General</h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-muted)' }}>
            Estado operativo del catálogo de Accesorios PH
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/admin/products"
            className="btn btn-primary"
            style={{ fontSize: '0.88rem', padding: '0.6rem 1.15rem' }}
          >
            <Plus size={16} />
            <span>Gestionar Productos</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}
      >
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              to={c.link}
              style={{
                backgroundColor: 'var(--color-white)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--color-gray-muted)',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  {c.label}
                </span>
                <span
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: 'var(--color-black)'
                  }}
                >
                  {isLoading ? '...' : c.value}
                </span>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-bg-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.color
                }}
              >
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Products Card */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.75rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Últimos Productos Añadidos</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-muted)' }}>
              Accesorios recientemente sincronizados con el catálogo
            </p>
          </div>
          <Link
            to="/admin/products"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-black)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Ver todos</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentProducts.map((p) => {
            const cover =
              p.media?.find((m: any) => m.isCover)?.url ||
              p.media?.[0]?.url ||
              '';

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-light)',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={p.name}
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
                          fontSize: '0.65rem'
                        }}
                      >
                        N/A
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{p.name}</h4>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-gray-muted)'
                      }}
                    >
                      {p.category?.name || 'Categoría'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    {formatBs(p.pricing?.finalPrice || p.price)}
                  </div>
                  {p.pricing?.hasDiscount && (
                    <span
                      className="badge badge-discount"
                      style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                    >
                      {p.pricing.discountPercentage}% OFF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
