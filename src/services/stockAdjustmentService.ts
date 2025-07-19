
import api from './api';

export interface StockAdjustment {
    stockAdjustmentId: number;
    adjustmentNo: string;
    reason: string;
    description: string;
    adjustmentDate: Date;
    updatedDate: Date;
    adjustmentType: string;
    createdBy: string;
    updatedBy: string;
    productVariantId: number;
    productName: string;
    productColor: string;
    productSize: string;
    productQuantity: number;
}

export const stockAdjustmentService = {
    getAllAdjustments: async () => {
        const response = await api.get<StockAdjustment[]>('/api/StockAdjustment');
        return response.data;
    },

    getAdjustmentById: async (id: number) => {
        const response = await api.get<StockAdjustment>(`/api/StockAdjustment/${id}`);        
        return response.data;
    },

    createAdjustment: async (adjustment: Omit<StockAdjustment, 'stockAdjustmentId'>) => {
        const response = await api.post<StockAdjustment>('/api/StockAdjustment', adjustment);
        return response.data;
    },

    updateAdjustment: async (id: number, adjustment: Partial<StockAdjustment>) => {
        const response = await api.put<StockAdjustment>(`/api/StockAdjustment/${id}`, adjustment);
        return response.data;
    },

    deleteAdjustment: async (id: number) => {
        await api.delete(`/api/StockAdjustment/${id}`);
    }
};
