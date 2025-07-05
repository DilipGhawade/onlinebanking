import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  console.log('ProtectedRoute rendering');
  console.log('Current path:', window.location.pathname);
  
  const [isLoading, setIsLoading] = useState(true);
  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, loading, user } = authState || {};
  const location = useLocation();

  console.log('Auth state:', { isAuthenticated, loading, user });

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, loading });
    // Set loading to false once authentication state is determined
    if (!loading) {
      console.log('Auth loading complete, isAuthenticated:', isAuthenticated);
      setIsLoading(false);
    }
  }, [loading, isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('Showing loading spinner while checking auth');
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login with the return url
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log('User is authenticated, rendering children');
  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
