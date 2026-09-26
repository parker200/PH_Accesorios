import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { CartProvider } from './contexts/CartContext.js';
import { CartModal } from './components/cart/CartModal.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.js';
import { AdminLayout } from './layouts/AdminLayout.js';

// Pages
import { HomeCatalogPage } from './pages/public/HomeCatalogPage.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.js';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.js';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage.js';
import { AdminProfilePage } from './pages/admin/AdminProfilePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Public Catalog Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomeCatalogPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Backoffice */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="promotions" element={<AdminPromotionsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>
            </Routes>

            {/* Global Shopping Cart Modal */}
            <CartModal />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
