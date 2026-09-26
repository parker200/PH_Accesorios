import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Percent,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatBs } from '../../utils/formatters.js';

interface Promotion {
  id: string;
  name: string;
  type: 'product' | 'category';
  discountPercentage: number;
  productId?: string;
  categoryId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  product?: { id: string; name: string; price: number };
  category?: { id: string; name: string };
  exclusions?: { id: string; product: { id: string; name: string } }[];
}

export const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'product' | 'category'>('product');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [productId, setProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [promosRes, prodsRes, catsRes] = await Promise.all([
        api.getPromotions(),
        api.getProducts({ limit: 100 }),
        api.getCategories(true)
      ]);
      setPromotions(promosRes.data || []);
      setProducts(prodsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error: any) {
      showToast(error.message || 'Error cargando promociones', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    const today = new Date();
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    setName('');
    setType('product');
    setDiscountPercentage('15');
    setProductId(products[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setStartDate(today.toISOString().slice(0, 16));
    setEndDate(nextMonth.toISOString().slice(0, 16));
    setIsActive(true);
    setExcludedProductIds([]);
    setIsModalOpen(true);
  };

  const handleExclusionToggle = (prodId: string) => {
    setExcludedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const discount = parseFloat(discountPercentage);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      showToast('El descuento debe estar entre 1% y 100%', 'error');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showToast('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPromotion({
        name,
        type,
        discountPercentage: discount,
        productId: type === 'product' ? productId : null,
        categoryId: type === 'category' ? categoryId : null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive,
        excludedProductIds: type === 'category' ? excludedProductIds : []
      });

      showToast('Promoción creada con éxito', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al guardar promoción', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promo: Promotion) => {
    if (!window.confirm(`¿Estás seguro de eliminar la promoción "${promo.name}"?`)) {
      return;
    }

    try {
      await api.deletePromotion(promo.id);
      showToast('Promoción eliminada', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar promoción', 'error');
    }
  };

  const getPromoStatus = (promo: Promotion) => {
    if (!promo.isActive) {
      return { label: 'Desactivada', color: 'badge-inactive', icon: AlertTriangle };
    }
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    if (now < start) {
      return { label: 'Programada (Futura)', color: 'badge-category', icon: Clock };
    }
    if (now > end) {
      return { label: 'Vencida / Expirada', color: 'badge-inactive', icon: AlertTriangle };
    }
    return { label: 'Vigente en Catálogo', color: 'badge-active', icon: CheckCircle };
  };

  const categoryProducts = products.filter((p) => p.category?.id === categoryId);

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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Gestión de Promociones</h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-muted)' }}>
            Configura descuentos por producto o por categoría con fechas y excepciones automáticas
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>Nueva Promoción</span>
        </button>
      </div>

      {/* Promos Table */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden'
        }}
      >
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray-muted)' }}>
            Cargando promociones...
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Percent size={36} color="var(--color-gray-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No hay promociones configuradas</h3>
            <p style={{ marginBottom: '1.5rem' }}>Crea ofertas con descuentos automáticos para incentivar ventas.</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              Crear Promoción
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-gray-border)',
                    backgroundColor: 'var(--color-bg-light)',
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--color-gray-muted)'
                  }}
                >
                  <th style={{ padding: '1rem 1.5rem' }}>Promoción</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Tipo y Alcance</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Descuento</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Vigencia</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Estado Actual</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => {
                  const status = getPromoStatus(p);
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--color-gray-border)',
                        fontSize: '0.9rem'
                      }}
                    >
                      <td style={{ padding: '1.15rem 1.5rem', fontWeight: 700 }}>
                        {p.name}
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        {p.type === 'product' ? (
                          <div>
                            <span className="badge badge-category">Producto Específico</span>
                            <div style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: 600 }}>
                              {p.product?.name || 'Producto seleccionado'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="badge badge-discount">Toda la Categoría</span>
                            <div style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: 600 }}>
                              {p.category?.name || 'Categoría seleccionada'}
                            </div>
                            {p.exclusions && p.exclusions.length > 0 && (
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  color: 'var(--color-danger)',
                                  marginTop: '2px'
                                }}
                              >
                                {p.exclusions.length} excepción(es) excluida(s)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <span
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: 'var(--color-black)'
                          }}
                        >
                          {p.discountPercentage}% OFF
                        </span>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', fontSize: '0.82rem', color: 'var(--color-gray-muted)' }}>
                        <div>{new Date(p.startDate).toLocaleDateString()}</div>
                        <div>hasta {new Date(p.endDate).toLocaleDateString()}</div>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <span
                          className={`badge ${status.color}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(p)}
                          className="btn btn-outline"
                          style={{
                            padding: '0.45rem 0.75rem',
                            color: 'var(--color-danger)',
                            borderColor: '#fee2e2'
                          }}
                          title="Eliminar promoción"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nueva Promoción */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(20, 15, 12, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: 'var(--shadow-modal)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Crear Promoción</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ color: 'var(--color-gray-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre de la Promoción *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Oferta Flash 20% en Cargadores GaN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Tipo de Promoción */}
              <div className="form-group">
                <label className="form-label">Tipo de Alcance *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setType('product')}
                    className={`btn ${type === 'product' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.75rem', justifyContent: 'center' }}
                  >
                    Por Producto Específico
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('category')}
                    className={`btn ${type === 'category' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.75rem', justifyContent: 'center' }}
                  >
                    Por Toda una Categoría
                  </button>
                </div>
              </div>

              {/* Selector dinámico según tipo */}
              {type === 'product' ? (
                <div className="form-group">
                  <label className="form-label">Selecciona el Producto *</label>
                  <select
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="form-select"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatBs(p.price)} ({p.category?.name})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Selecciona la Categoría *</label>
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setExcludedProductIds([]);
                      }}
                      className="form-select"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exclusiones para categoría */}
                  <div className="form-group">
                    <label className="form-label">
                      Excepciones (Productos excluidos de este descuento)
                    </label>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-gray-muted)', marginBottom: '8px' }}>
                      Marca los productos que NO deben recibir este descuento de categoría:
                    </p>
                    <div
                      style={{
                        maxHeight: '140px',
                        overflowY: 'auto',
                        border: '1px solid var(--color-gray-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-bg-light)'
                      }}
                    >
                      {categoryProducts.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-muted)' }}>
                          No hay productos en esta categoría
                        </div>
                      ) : (
                        categoryProducts.map((prod) => (
                          <label
                            key={prod.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '4px 0',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={excludedProductIds.includes(prod.id)}
                              onChange={() => handleExclusionToggle(prod.id)}
                            />
                            <span>{prod.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Porcentaje de descuento */}
              <div className="form-group">
                <label className="form-label">Porcentaje de Descuento (%) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      color: 'var(--color-gray-muted)'
                    }}
                  >
                    %
                  </span>
                </div>
              </div>

              {/* Rango de Fechas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div className="form-group">
                  <label className="form-label">Fecha y Hora de Inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha y Hora de Fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '2rem',
                  cursor: 'pointer'
                }}
                onClick={() => setIsActive(!isActive)}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Promoción habilitada
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Promoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
