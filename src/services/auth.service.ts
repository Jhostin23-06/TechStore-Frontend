import apiService from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserData {
  id: number;
  username: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  userId?: number;
}

// Claim types del backend .NET
const ClaimTypes = {
  NameIdentifier: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  Name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  Role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
} as const;

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.token) {
        this.setToken(response.token);
        const userData = this.decodeToken(response.token);
        this.setUser(userData);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Asegúrate de que los datos tengan el formato correcto
      const registerData = {
        username: userData.username,
        password: userData.password,
        role: userData.role || 'User'
      };
      
      console.log('Enviando datos de registro:', registerData);
      
      const response = await apiService.post<RegisterResponse>('/auth/register', registerData);
      
      console.log('Respuesta del registro:', response);
      
      return response;
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Proporcionar un mensaje de error más útil
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error al registrar usuario. Por favor intenta nuevamente.');
      }
    }
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getUser(): UserData | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    
    // Si no está en localStorage, intentar decodificar del token
    const token = this.getToken();
    if (token) {
      const userData = this.decodeToken(token);
      this.setUser(userData);
      return userData;
    }
    
    return null;
  }

  setUser(user: UserData): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = this.decodeToken(token);
      const expirationTime = decoded.exp * 1000;
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  decodeToken(token: string): UserData & { exp: number } {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      return {
        id: parseInt(payload[ClaimTypes.NameIdentifier] || payload.nameid || '0'),
        username: payload[ClaimTypes.Name] || payload.unique_name || payload.sub || '',
        role: payload[ClaimTypes.Role] || payload.role || '',
        exp: payload.exp || 0
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      throw new Error('Token inválido');
    }
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Método para verificar roles
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return roles.includes(user?.role || '');
  }
}

export const authService = new AuthService();
export default authService;