import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isAuthLoading } = useStore();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E2E8E5] px-6 py-4 flex items-center gap-3 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.05)]">
          <div className="w-4 h-4 border-2 border-[#3A6B5C] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#52605A]">
            Memeriksa sesi kasir...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
