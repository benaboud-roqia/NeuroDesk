import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  RegisterData, 
  LoginData, 
  AuthResponse, 
  DataSession, 
  DataResponse, 
  PatientStats, 
  StatsResponse 
} from '../types/index';

// Configuration de l'instance axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Inscription
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Récupérer le profil
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (userData: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put<{ message: string; user: User }>('/auth/profile', userData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Service pour les données du gant
export const dataService = {
  // Recevoir des données
  receiveData: async (data: {
    patientId: string;
    sessionId?: string;
    emg: any;
    temperature: any;
    pression: any;
    metadata?: any;
  }): Promise<{ message: string; dataId: string; sessionId: string }> => {
    const response = await api.post('/data/receive', data);
    return response.data;
  },

  // Récupérer les données d'un patient
  getPatientData: async (
    patientId: string,
    params?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      typeTest?: string;
      status?: string;
    }
  ): Promise<DataResponse> => {
    const response = await api.get<DataResponse>(`/data/patient/${patientId}`, { params });
    return response.data;
  },

  // Récupérer une session spécifique
  getSessionData: async (sessionId: string): Promise<{ data: DataSession }> => {
    const response = await api.get<{ data: DataSession }>(`/data/session/${sessionId}`);
    return response.data;
  },

  // Récupérer les statistiques d'un patient
  getPatientStats: async (
    patientId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>(`/data/patient/${patientId}/stats`, { params });
    return response.data;
  },

  // Mettre à jour l'analyse IA
  updateAnalysis: async (
    sessionId: string,
    analysis: {
      prediction: string;
      confiance: number;
      pathologieDetectee: Array<{ nom: string; probabilite: number }>;
      recommandations: string[];
    }
  ): Promise<{ message: string; data: DataSession }> => {
    const response = await api.put<{ message: string; data: DataSession }>(
      `/data/session/${sessionId}/analysis`,
      analysis
    );
    return response.data;
  },

  // Supprimer une session (admin seulement)
  deleteSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/data/session/${sessionId}`);
    return response.data;
  },
};

// Service pour les utilitaires
export const utilsService = {
  // Vérifier la santé de l'API
  healthCheck: async (): Promise<{ status: string; timestamp: string; uptime: number; database: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Export nommé de l'instance api
export { api };
export default api; 