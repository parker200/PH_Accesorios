import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  Upload,
  Star,
  Search,
  Power
} from 'lucide-react';
import { formatBs } from '../../utils/formatters.js';

interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  storagePath: string;
  isCover: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  media: ProductMedia[];
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ name: string; type: string; url: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media Manager Modal State
  const [managingMediaProduct, setManagingMediaProduct] = useState<Product | null>(null);
  const [uploadingMoreMedia, setUploadingMoreMedia] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      let activeParam: boolean | 'all' | undefined = 'all';
      if (statusFilter === 'active') activeParam = true;
      if (statusFilter === 'inactive') activeParam = false;

      const [prodsRes, catsRes] = await Promise.all([
        api.getProducts({
          search: search || undefined,
          categoryId: selectedCategoryFilter || undefined,
          isActive: activeParam,
          all: activeParam === 'all' ? true : undefined
        }),
        api.getCategories(true)
      ]);
      setProducts(prodsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error: any) {
      showToast(error.message || 'Error al obtener productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategoryFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setIsActive(true);
    setFilesToUpload([]);
    setFilePreviews([]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setDescription(p.description || '');
    setPrice(String(p.price));
    setIsActive(p.isActive);
    setFilesToUpload([]);
    setFilePreviews([]);
    setIsModalOpen(true);
  };

  // Validate files: JPG/PNG, and videos max 5 seconds
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const previews: { name: string; type: string; url: string }[] = [];

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        // Validate duration max 5 seconds
        const duration = await getVideoDuration(file);
        if (duration > 5.5) {
          showToast(
            `El video "${file.name}" supera los 5 segundos (${duration.toFixed(1)}s). Máx permitido: 5s.`,
            'error'
          );
          continue;
        }
      }

      validFiles.push(file);
      previews.push({
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url: URL.createObjectURL(file)
      });
    }

    setFilesToUpload((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const removeFileFromUpload = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      showToast('Por favor selecciona una categoría', 'error');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast('El precio debe ser un número válido mayor a 0', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let savedProduct: any;

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, {
          name,
          categoryId,
          description,
          price: numPrice,
          isActive
        });
        savedProduct = res.data;
        showToast('Producto actualizado con éxito', 'success');
      } else {
        const res = await api.createProduct({
          name,
          categoryId,
          description,
          price: numPrice,
          isActive
        });
        savedProduct = res.data;
        showToast('Producto creado con éxito', 'success');
      }

      // Upload files if any
      if (filesToUpload.length > 0 && savedProduct?.id) {
        const formData = new FormData();
        filesToUpload.forEach((file) => {
          formData.append('files', file);
        });
        await api.uploadProductMedia(savedProduct.id, formData);
        showToast('Fotos/Videos subidos correctamente', 'success');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al guardar producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      return;
    }

    try {
      await api.deleteProduct(product.id);
      showToast('Producto eliminado', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar producto', 'error');
    }
  };

  const handleToggleActive = async (product: Product) => {
    const newStatus = !product.isActive;
    // Optimistic UI update so it immediately reflects in the row without disappearing
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p))
    );

    try {
      await api.updateProduct(product.id, { isActive: newStatus });
      showToast(
        `"${product.name}" ahora está ${newStatus ? 'Activo (Visible en tienda)' : 'Inactivo (Pausado)'}`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Error al alternar estado del producto', 'error');
      fetchData(); // Rollback on error
    }
  };

  // Media Manager Actions
  const handleMediaUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!managingMediaProduct || !e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        const duration = await getVideoDuration(file);
        if (duration > 5.5) {
          showToast(`El video supera los 5 segundos (${duration.toFixed(1)}s)`, 'error');
          continue;
        }
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingMoreMedia(true);
    try {
      const formData = new FormData();
      validFiles.forEach((f) => formData.append('files', f));
      await api.uploadProductMedia(managingMediaProduct.id, formData);
      showToast('Archivos subidos con éxito', 'success');

      // Refresh product in state
      const updated = await api.getProduct(managingMediaProduct.id);
      setManagingMediaProduct(updated.data);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al subir medios', 'error');
    } finally {
      setUploadingMoreMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!managingMediaProduct) return;
    try {
      await api.deleteProductMedia(managingMediaProduct.id, mediaId);
      showToast('Archivo eliminado', 'success');
      const updated = await api.getProduct(managingMediaProduct.id);
      setManagingMediaProduct(updated.data);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar archivo', 'error');
    }
  };

  const handleSetCover = async (mediaId: string) => {
    if (!managingMediaProduct) return;
    try {
      await api.setCoverMedia(managingMediaProduct.id, mediaId);
      showToast('Foto principal actualizada', 'success');
      const updated = await api.getProduct(managingMediaProduct.id);
      setManagingMediaProduct(updated.data);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Error al cambiar portada', 'error');
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Gestión de Productos</h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-muted)' }}>
            Administra fotos, videos de 5s, descripciones y precios de los accesorios
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search
            size={18}
            color="var(--color-gray-muted)"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            className="form-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="form-select"
          style={{ width: '220px' }}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="form-select"
          style={{ width: '200px' }}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Solo Activos (Visibles)</option>
          <option value="inactive">Solo Pausados (Ocultos)</option>
        </select>

        <button onClick={fetchData} className="btn btn-outline" style={{ padding: '0.75rem 1rem' }}>
          Buscar
        </button>
      </div>

      {/* Products Table */}
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
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Package size={36} color="var(--color-gray-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No se encontraron productos</h3>
            <p style={{ marginBottom: '1.5rem' }}>Crea tu primer producto para el catálogo.</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              Crear Producto
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
                  <th style={{ padding: '1rem 1.5rem' }}>Producto</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Categoría</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Precio Base</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Medios</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Estado</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cover =
                    p.media.find((m) => m.isCover)?.url ||
                    p.media[0]?.url ||
                    '';
                  const videoCount = p.media.filter((m) => m.type === 'video').length;

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--color-gray-border)',
                        fontSize: '0.9rem'
                      }}
                    >
                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              backgroundColor: '#f1f1f2',
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
                                  fontSize: '0.7rem'
                                }}
                              >
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-black)' }}>
                              {p.name}
                            </div>
                            <code style={{ fontSize: '0.75rem', color: 'var(--color-gray-muted)' }}>
                              {p.slug}
                            </code>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <span className="badge badge-category">{p.category?.name}</span>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', fontWeight: 800 }}>
                        {formatBs(p.price)}
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <button
                          onClick={() => setManagingMediaProduct(p)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <ImageIcon size={14} />
                          <span>{p.media.length} medios</span>
                          {videoCount > 0 && (
                            <span
                              style={{
                                backgroundColor: 'var(--color-sky-blue)',
                                color: 'var(--color-black)',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700
                              }}
                            >
                              Vid
                            </span>
                          )}
                        </button>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            border: 'none',
                            padding: '4px 10px'
                          }}
                          title="Haz clic para alternar entre Activo y Pausado"
                        >
                          <Power size={12} />
                          <span>{p.isActive ? 'Activo' : 'Pausado'}</span>
                        </button>
                      </td>

                      <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.75rem' }}
                            title="Editar datos"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem 0.75rem',
                              color: 'var(--color-danger)',
                              borderColor: '#fee2e2'
                            }}
                            title="Eliminar producto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal (Create / Edit) */}
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
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Accesorio'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ color: 'var(--color-gray-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cable Trenzado Kevlar USB-C a Lightning 1.8m"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-select"
                  >
                    <option value="" disabled>
                      Seleccionar categoría
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio Regular (Bs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción Detallada</label>
                <textarea
                  rows={4}
                  placeholder="Materiales, especificaciones técnicas, compatibilidad..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Media Upload Area */}
              <div className="form-group">
                <label className="form-label">
                  Fotos (JPG/PNG) y Video Corto (Máx. 5 seg)
                </label>
                <div
                  style={{
                    border: '2px dashed var(--color-gray-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-bg-light)',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload
                    size={28}
                    color="var(--color-gray-muted)"
                    style={{ margin: '0 auto 8px' }}
                  />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-black)' }}>
                    Haz clic para seleccionar imágenes o video de 5 segundos
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-gray-muted)' }}>
                    JPG, PNG hasta 5MB. Video MP4/WEBM hasta 5 segundos de duración.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    style={{ display: 'none' }}
                    onChange={handleFileSelection}
                  />
                </div>

                {/* Previews */}
                {filePreviews.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginTop: '1rem'
                    }}
                  >
                    {filePreviews.map((prev, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid var(--color-gray-border)'
                        }}
                      >
                        {prev.type === 'video' ? (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#140F0C',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Video size={20} />
                          </div>
                        ) : (
                          <img
                            src={prev.url}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeFileFromUpload(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  Producto activo y disponible en el catálogo
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
                  {isSubmitting ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Manager Modal */}
      {managingMediaProduct && (
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
          onClick={() => setManagingMediaProduct(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '650px',
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
                marginBottom: '1rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Fotos y Video de Producto
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-muted)' }}>
                  {managingMediaProduct.name}
                </p>
              </div>
              <button
                onClick={() => setManagingMediaProduct(null)}
                style={{ color: 'var(--color-gray-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Media Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '1rem',
                margin: '1.5rem 0',
                maxHeight: '350px',
                overflowY: 'auto'
              }}
            >
              {managingMediaProduct.media.map((med) => (
                <div
                  key={med.id}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: med.isCover
                      ? '2px solid var(--color-black)'
                      : '1px solid var(--color-gray-border)',
                    position: 'relative',
                    aspectRatio: '1/1',
                    backgroundColor: '#F8F9FA'
                  }}
                >
                  {med.type === 'video' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#140F0C',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Video size={24} />
                      <span style={{ fontSize: '0.7rem' }}>Video 5s</span>
                    </div>
                  ) : (
                    <img
                      src={med.url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Actions overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      display: 'flex',
                      gap: '4px'
                    }}
                  >
                    {med.type === 'image' && (
                      <button
                        onClick={() => handleSetCover(med.id)}
                        style={{
                          backgroundColor: med.isCover ? 'var(--color-black)' : 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                        title={med.isCover ? 'Foto principal' : 'Marcar como principal'}
                      >
                        <Star size={13} fill={med.isCover ? '#fff' : 'none'} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMedia(med.id)}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.85)',
                        color: '#fff',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      title="Eliminar archivo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {med.isCover && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        backgroundColor: 'var(--color-black)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      Portada
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Upload more */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                className="btn btn-outline"
                style={{ cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <Plus size={16} />
                <span>{uploadingMoreMedia ? 'Subiendo...' : 'Añadir Más Medios'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  style={{ display: 'none' }}
                  onChange={handleMediaUploadDirect}
                  disabled={uploadingMoreMedia}
                />
              </label>

              <button
                onClick={() => setManagingMediaProduct(null)}
                className="btn btn-primary"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
