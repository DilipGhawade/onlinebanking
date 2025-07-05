import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { user } = useSelector((state) => state.auth);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(user);
    setLoading(false);
  }, [user]);

  const value = {
    currentUser,
    user: currentUser,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
