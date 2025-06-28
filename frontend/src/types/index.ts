// Types pour l'authentification
export interface User {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'patient' | 'medecin' | 'admin';
  dateNaissance?: string;
  telephone?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
  medecinReferent?: string;
  isActive: boolean;
  derniereConnexion: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role?: 'patient' | 'medecin' | 'admin';
  dateNaissance?: string;
  telephone?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

// Types pour les données du gant
export interface EMGData {
  values: number[];
  samplingRate: number;
  channel: 'channel1' | 'channel2' | 'channel3' | 'channel4';
}

export interface TemperatureData {
  value: number;
  unit: string;
  sensor: string;
}

export interface PressionData {
  value: number;
  unit: string;
  sensor: string;
}

export interface Metadata {
  duree: number;
  typeTest: 'repos' | 'contraction' | 'mouvement' | 'test_specifique';
  notes?: string;
  position: 'assise' | 'debout' | 'couchee' | 'marche';
}

export interface AnalysisIA {
  prediction: 'normal' | 'anormal' | 'suspect' | 'non_analyse';
  confiance: number;
  pathologieDetectee: Array<{
    nom: string;
    probabilite: number;
  }>;
  recommandations: string[];
  dateAnalyse?: string;
}

export interface DataSession {
  _id: string;
  patientId: string;
  sessionId: string;
  timestamp: string;
  emg: EMGData;
  temperature: TemperatureData;
  pression: PressionData;
  metadata: Metadata;
  analyseIA: AnalysisIA;
  status: 'brut' | 'traite' | 'analyse' | 'valide';
  duree: number;
}

// Interface pour les données patient simplifiées
export interface PatientData {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  status: 'normal' | 'anormal';
}

export interface PatientStats {
  totalSessions: number;
  sessionsWithAnalysis: number;
  analysisRate: number;
  averages: {
    avgTemperature?: number;
    avgPression?: number;
    minTemperature?: number;
    maxTemperature?: number;
    minPression?: number;
    maxPression?: number;
  };
  predictions: Array<{
    _id: string;
    count: number;
  }>;
  testTypes: Array<{
    _id: string;
    count: number;
  }>;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  details?: string[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface DataResponse {
  data: DataSession[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface StatsResponse {
  stats: PatientStats;
} 