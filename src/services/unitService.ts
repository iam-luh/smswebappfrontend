
import api from './api';

export interface Unit {    
    unitId?: number;    
    name?: string;    
    symbol?: string;    
    description?: string;   
   
}

export interface CreateUnitDto {
    Name: string;
    Symbol: string;
    Description?: string;
}

export const unitService = {
    getAllUnits: async () => {
        const response = await api.get<Unit[]>('/api/Unit');
        return response.data;
    },

    getUnitById: async (id: number) => {
        const response = await api.get<Unit>(`/api/Unit/${id}`);
        return response.data;
    },

    createUnit: async (unit: Omit<Unit, 'unitId'>) => {
        const response = await api.post<Unit>('/api/Unit', unit);
        return response.data;
    },

    updateUnit: async (id: number, unit: Partial<Unit>) => {
        const response = await api.put<Unit>(`/api/Unit/${id}`, unit);
        return response.data;
    },

    deleteUnit: async (id: number) => {
        await api.delete(`/api/Unit/${id}`);
    }
}; 
