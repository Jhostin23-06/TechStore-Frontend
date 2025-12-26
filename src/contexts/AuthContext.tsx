import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { UserData } from '../services/auth.service';

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación al cargar
    checkAuth();
  }, []);

  const checkAuth = () => {
    setLoading(true);
    const currentUser = authService.getUser();
    const isAuth = authService.isAuthenticated();
    
    if (isAuth && currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
      // No limpiamos automáticamente localStorage aquí
      // para permitir "recordarme" funcionalidad
    }
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await authService.login({ username, password });
      const currentUser = authService.getUser();
      setUser(currentUser);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Redirección se maneja en el servicio
  };

  const value = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};