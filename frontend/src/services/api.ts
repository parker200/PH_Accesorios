const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  errors?: any;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('ph_token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Error al procesar la respuesta del servidor'
    }));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('ph_token');
        localStorage.removeItem('ph_user');
      }
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  }

  // Auth
  async login(credentials: { username: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data: { username?: string; email?: string }) {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Categories
  async getCategories(all = false) {
    return this.request<any[]>(`/categories${all ? '?all=true' : ''}`);
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(data: { name: string; description?: string; isActive?: boolean }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Products
  async getProducts(params?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean | 'all';
    all?: boolean;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.search) query.set('search', params.search);
    if (params?.all) query.set('all', 'true');
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: {
    name: string;
    categoryId: string;
    description?: string;
    price: number;
    isActive?: boolean;
  }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      description?: string;
      price?: number;
      isActive?: boolean;
    }
  ) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadProductMedia(productId: string, formData: FormData) {
    return this.request(`/products/${productId}/media`, {
      method: 'POST',
      body: formData
    });
  }

  async deleteProductMedia(productId: string, mediaId: string) {
    return this.request(`/products/${productId}/media/${mediaId}`, {
      method: 'DELETE'
    });
  }

  async setCoverMedia(productId: string, mediaId: string) {
    return this.request(`/products/${productId}/media/${mediaId}/cover`, {
      method: 'PATCH'
    });
  }

  // Promotions
  async getPromotions() {
    return this.request<any[]>('/promotions');
  }

  async createPromotion(data: {
    name: string;
    type: 'product' | 'category';
    discountPercentage: number;
    productId?: string | null;
    categoryId?: string | null;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    excludedProductIds?: string[];
  }) {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePromotion(
    id: string,
    data: {
      name?: string;
      discountPercentage?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      excludedProductIds?: string[];
    }
  ) {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deletePromotion(id: string) {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiService();
