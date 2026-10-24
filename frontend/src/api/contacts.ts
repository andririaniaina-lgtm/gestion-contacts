import api from './client';
import type {
  Contact,
  ContactFilters,
  ContactFormData,
  PaginatedResponse,
  Stats,
} from '../types';

export const contactsService = {
  /**
   * Récupère la liste des contacts avec filtres, recherche, tri, pagination.
   */
  async list(filters: ContactFilters = {}): Promise<PaginatedResponse<Contact>> {
    const params = new URLSearchParams();

    if (filters.search)     params.append('search', filters.search);
    if (filters.category)   params.append('category', String(filters.category));
    if (filters.favorite)   params.append('favorite', 'true');
    if (filters.trash)      params.append('trash', 'true');
    if (filters.ordering)   params.append('ordering', filters.ordering);
    if (filters.page)       params.append('page', String(filters.page));

    const response = await api.get<PaginatedResponse<Contact>>(
      `/contacts/?${params.toString()}`
    );
    return response.data;
  },

  async get(id: number): Promise<Contact> {
    const response = await api.get<Contact>(`/contacts/${id}/`);
    return response.data;
  },

  /**
   * Créer un contact. Gère photo (multipart) ou JSON.
   */
  async create(data: ContactFormData): Promise<Contact> {
    const { photo, ...rest } = data;

    if (photo) {
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      formData.append('photo', photo);

      const response = await api.post<Contact>('/contacts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await api.post<Contact>('/contacts/', rest);
    return response.data;
  },

  async update(id: number, data: Partial<ContactFormData>): Promise<Contact> {
    const { photo, ...rest } = data;

    if (photo) {
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      formData.append('photo', photo);

      const response = await api.patch<Contact>(`/contacts/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await api.patch<Contact>(`/contacts/${id}/`, rest);
    return response.data;
  },

  /**
   * Supprimer définitivement un contact (pas utilisé côté UI principal).
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/contacts/${id}/`);
  },

  // ============================================================
  // ACTIONS SPÉCIALES
  // ============================================================

  async toggleFavorite(id: number): Promise<{ message: string; is_favorite: boolean }> {
    const response = await api.post(`/contacts/${id}/toggle_favorite/`);
    return response.data;
  },

  async softDelete(id: number): Promise<{ message: string }> {
    const response = await api.post(`/contacts/${id}/soft_delete/`);
    return response.data;
  },

  async restore(id: number): Promise<{ message: string }> {
    const response = await api.post(`/contacts/${id}/restore/`);
    return response.data;
  },

  async hardDelete(id: number): Promise<void> {
    await api.delete(`/contacts/${id}/hard_delete/`);
  },

  async emptyTrash(): Promise<{ message: string }> {
    const response = await api.post('/contacts/empty_trash/');
    return response.data;
  },

  async getStats(): Promise<Stats> {
    const response = await api.get<Stats>('/contacts/stats/');
    return response.data;
  },

  // ============================================================
  // IMPORT / EXPORT CSV
  // ============================================================

  /**
   * Télécharge le CSV des contacts.
   */
  async exportCSV(): Promise<Blob> {
    const response = await api.get('/contacts/export/', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Importe un fichier CSV.
   */
  async importCSV(file: File): Promise<{
    message: string;
    created: number;
    skipped: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/contacts/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};