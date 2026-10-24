// ============================================================
// UTILISATEUR
// ============================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ============================================================
// CATÉGORIE
// ============================================================

export interface Category {
  id: number;
  name: string;
  color: string;
  contacts_count: number;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
}

// ============================================================
// CONTACT
// ============================================================

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  company: string;
  job_title: string;
  category: number | null;
  category_name: string | null;
  category_color: string | null;
  notes: string;
  photo: string | null;
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  company?: string;
  job_title?: string;
  category?: number | null;
  notes?: string;
  photo?: File | null;
}

// ============================================================
// PAGINATION
// ============================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================
// STATISTIQUES
// ============================================================

export interface Stats {
  total: number;
  favorites: number;
  categories: number;
  trash: number;
}

// ============================================================
// FILTRES CONTACTS
// ============================================================

export interface ContactFilters {
  search?: string;
  category?: number | null;
  favorite?: boolean;
  trash?: boolean;
  ordering?: string;
  page?: number;
}