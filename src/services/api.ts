import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import authService from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080/api'

class ApiService {
  private api: AxiosInstance
  private isRefreshing = false;

  private failedRequests: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error)
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Si es error 401 y no es una petición de login
        if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/login')) {
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            // Limpiar datos de autenticación y redirigir
            authService.logout();
            return Promise.reject(new Error('Sesión expirada. Por favor inicie sesión nuevamente.'));
          }
        }

        // Si es error 307 (Temporary Redirect)
        if (error.response?.status === 307) {
          // El backend está redirigiendo porque no hay token o es inválido
          console.warn('Redirección 307 detectada - Token inválido o no proporcionado');

          if (!authService.isAuthenticated()) {
            window.location.href = '/login';
            return Promise.reject(new Error('No autenticado. Redirigiendo a login...'));
          }

          // Si hay token pero aún así redirige, token podría estar expirado
          authService.logout();
          return Promise.reject(new Error('Token expirado o inválido. Por favor inicie sesión nuevamente.'));
        }

        // Otros errores
        const message = error.response?.data || error.message;

        console.error('API Error:', {
          status: error.response?.status,
          url: originalRequest.url,
          message,
          data: error.response?.data
        });

        return Promise.reject({
          message: typeof message === 'string'
            ? message
            : 'Error en la solicitud',
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService