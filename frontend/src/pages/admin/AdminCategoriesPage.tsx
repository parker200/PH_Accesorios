import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Tags, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.getCategories(true);
      setCategories(res.data || []);
    } catch (error: any) {
      showToast(error.message || 'Error cargando categorías', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name,
          description,
          isActive
        });
        showToast('Categoría actualizada con éxito', 'success');
      } else {
        await api.createCategory({
          name,
          description,
          isActive
        });
        showToast('Categoría creada con éxito', 'success');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Error al guardar categoría', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat._count && cat._count.products > 0) {
      showToast(
        `No se puede eliminar: tiene ${cat._count.products} productos asociados. Reasigna o elimina los productos primero.`,
        'error'
      );
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${cat.name}"?`)) {
      return;
    }

    try {
      await api.deleteCategory(cat.id);
      showToast('Categoría eliminada', 'success');
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar categoría', 'error');
    }
  };

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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Gestión de Categorías</h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-muted)' }}>
            Crea, edita y organiza las categorías de accesorios para el catálogo
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Table Container */}
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
            Cargando categorías...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Tags size={36} color="var(--color-gray-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No hay categorías registradas</h3>
            <p style={{ marginBottom: '1.5rem' }}>Crea tu primera categoría para organizar productos.</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              Crear Categoría
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
                  <th style={{ padding: '1rem 1.5rem' }}>Nombre</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Slug</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Productos</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Estado</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    style={{
                      borderBottom: '1px solid var(--color-gray-border)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <td style={{ padding: '1.15rem 1.5rem', fontWeight: 700 }}>
                      {cat.name}
                      {cat.description && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 400,
                            color: 'var(--color-gray-muted)'
                          }}
                        >
                          {cat.description}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.15rem 1.5rem', color: 'var(--color-gray-muted)' }}>
                      <code>{cat.slug}</code>
                    </td>
                    <td style={{ padding: '1.15rem 1.5rem' }}>
                      <span className="badge badge-category">
                        {cat._count?.products || 0} artículos
                      </span>
                    </td>
                    <td style={{ padding: '1.15rem 1.5rem' }}>
                      <span
                        className={`badge ${cat.isActive ? 'badge-active' : 'badge-inactive'}`}
                      >
                        {cat.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn btn-outline"
                          style={{ padding: '0.45rem 0.75rem' }}
                          title="Editar categoría"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="btn btn-outline"
                          style={{
                            padding: '0.45rem 0.75rem',
                            color: 'var(--color-danger)',
                            borderColor: '#fee2e2'
                          }}
                          title="Eliminar categoría"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit Category */}
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
              maxWidth: '500px',
              width: '100%',
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ color: 'var(--color-gray-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre de Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Auriculares, Cargadores GaN..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción (Opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Breve descripción para el catálogo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
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
                  Categoría visible en la tienda pública
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
                  {isSubmitting ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
