
import api from './api';

export interface Size {   
    sizeId: number;    
    name: string;         
    description: string;      
}

export interface CreateSizeDto {
    Name: string;
    Description?: string;
}

export const sizeService = {
    getAllSizes: async () => {
        const response = await api.get<Size[]>('/api/Size');
        return response.data;
    },

    getSizeById: async (id: number) => {
        const response = await api.get<Size>(`/api/Size/${id}`);
        return response.data;
    },

    createSize: async (size: Omit<Size, 'sizeId'>) => {
        const response = await api.post<Size>('/api/Size', size);
        return response.data;
    },

    updateSize: async (id: number, size: Partial<Size>) => {
        const response = await api.put<Size>(`/api/Size/${id}`, size);
        return response.data;
    },

    deleteSize: async (id: number) => {
        await api.delete(`/api/Size/${id}`);
    }
}; 
