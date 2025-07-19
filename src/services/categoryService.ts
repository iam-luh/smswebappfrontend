import api from './api';

export interface Category {
    categoryId: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export const categoryService = {
    getAllCategories: async () => {
        const response = await api.get<Category[]>('/api/Category');
        return response.data;
    },

    getCategoryById: async (id: number) => {
        const response = await api.get<Category>(`/api/Category/${id}`);
        return response.data;
    },

    createCategory: async (category: Omit<Category, 'categoryId' | 'createdAt' | 'updatedAt'>) => {
        const response = await api.post<Category>('/api/Category', category);
        return response.data;
    },

    updateCategory: async (id: number, category: Partial<Category>) => {
        const response = await api.put<Category>(`/api/Category/${id}`, category);
        return response.data;
    },

    deleteCategory: async (id: number) => {
        await api.delete(`/api/Category/${id}`);
    }
}; 