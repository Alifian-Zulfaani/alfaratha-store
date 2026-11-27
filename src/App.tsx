import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy load internal Auth, POS & Inventory routes so public Landing Page bundle stays minimal
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const AdminLayout = lazy(() =>
  import('./components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const PosTerminalPage = lazy(() =>
  import('./pages/admin/PosTerminalPage').then((m) => ({ default: m.PosTerminalPage }))
);
const InventoryPage = lazy(() =>
  import('./pages/admin/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const TransactionsPage = lazy(() =>
  import('./pages/admin/TransactionsPage').then((m) => ({ default: m.TransactionsPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/admin/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const ContentCmsPage = lazy(() =>
  import('./pages/admin/ContentCmsPage').then((m) => ({ default: m.ContentCmsPage }))
);

const RouteFallback: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center text-xs font-medium text-[#52605A]">
    Memuat Alfaratha Workspace...
  </div>
);

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<Navigate to="/admin/pos" replace />} />
          <Route
            path="/admin/pos"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PosTerminalPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <InventoryPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <TransactionsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cms"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ContentCmsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </StoreProvider>
  );
};

export default App;
