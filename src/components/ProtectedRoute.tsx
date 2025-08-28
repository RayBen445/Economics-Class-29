import React from 'react';
import { UserProfile } from '../utils/firebase';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  profile: UserProfile | null;
  loading: boolean;
  requiredRoles?: ('Student' | 'Admin' | 'Class President')[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  profile,
  loading,
  requiredRoles,
  fallback
}) => {
  if (loading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!profile) {
    return <div className="error-message">Access denied: User profile not found</div>;
  }

  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    return (
      fallback || (
        <div className="error-message">
          Access denied: You don't have permission to view this page.
        </div>
      )
    );
  }

  return <>{children}</>;
};