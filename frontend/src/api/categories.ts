import api from './client';
import type { Category, CategoryFormData, PaginatedResponse } from '../types';

export const categoriesService = {
  /**
   * Récupère la liste des catégories.
   * ⚠️ L'API renvoie une réponse paginée → on extrait `.results`.
   */
  async list(): Promise<Category[]> {
    const response = await api.get<PaginatedResponse<Category> | Category[]>(
      '/categories/'
    );

    // Si la réponse est paginée (objet avec `results`), on extrait le tableau
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },

  async get(id: number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}/`);
    return response.data;
  },

  async create(data: CategoryFormData): Promise<Category> {
    const response = await api.post<Category>('/categories/', data);
    return response.data;
  },

  async update(id: number, data: Partial<CategoryFormData>): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}/`);
  },
};