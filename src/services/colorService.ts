
import api from './api';

export interface Color {    
    colorId: number;   
    name: string;   
    hex?: string;        
}

export interface CreateColorDto {
    Name: string;
    Hex?: string;
}

export const colorService = {
    getAllColors: async () => {
        const response = await api.get<Color[]>('/api/Color');
        return response.data;
    },

    getColorById: async (id: number) => {
        const response = await api.get<Color>(`/api/Color/${id}`);
        return response.data;
    },

    createColor: async (color: Omit<Color, 'colorId'>) => {
        const response = await api.post<Color>('/api/Color', color);
        return response.data;
    },

    updateColor: async (id: number, color: Partial<Color>) => {
        const response = await api.put<Color>(`/api/Color/${id}`, color);
        return response.data;
    },

    deleteColor: async (id: number) => {
        await api.delete(`/api/Color/${id}`);
    }
}; 
