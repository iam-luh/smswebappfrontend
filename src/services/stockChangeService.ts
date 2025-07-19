import api from './api';

export interface StockChange {
    stockChangeID: number;
    productQuantity: number;
    stockChangeType: string; // "IN" or "OUT"
    addedDate: Date;
    productName: string;
    productColor: string;
    productSize: string;
    productVariantID: number;
    productUnit: string;
}

export const stockChangeService = {
    getAllChanges: async () => {
        const response = await api.get<StockChange[]>('/api/StockChange');
        return response.data;
    },

    getChangeById: async (id: number) => {
        const response = await api.get<StockChange>(`/api/StockChange/${id}`);
        return response.data;
    },

    createChange: async (change: Omit<StockChange, 'stockChangeID' | 'changedAt'>) => {
        const response = await api.post<StockChange>('/api/StockChange', change);
        return response.data;
    },

    updateChange: async (id: number, change: Partial<StockChange>) => {
        const response = await api.put<StockChange>(`/api/StockChange/${id}`, change);
        return response.data;
    },

    deleteChange: async (id: number) => {
        await api.delete(`/api/StockChange/${id}`);
    }
}; 