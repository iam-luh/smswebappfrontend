
import api from './api';

export interface ProductStock {
    productId: number;
    productName: string;
    productColor: string;
    productSize: string;
    actualProductQuantity: number;
    thresholdProductQuantity: number;
    productUnit: string;
    createdAt: Date;
    updatedAt: Date;
}

export const productService = {
    // Get all products
    getAllProducts: async () => {
        const response = await api.get<ProductStock[]>('/api/Product');
        return response.data;
    },

    // Get product by ID
    getProductById: async (id: number) => {
        const response = await api.get<ProductStock>(`/api/Product/${id}`);
        return response.data;
    },

    // Create new product
    createProduct: async (product: Omit<ProductStock, 'productId'>) => {
        const response = await api.post<ProductStock>('/api/Product', product);
        return response.data;
    },

    // Update product
    updateProduct: async (id: number, product: Partial<ProductStock>) => {
        const response = await api.put<ProductStock>(`/api/Product/${id}`, product);
        return response.data;
    },

    // Delete product
    deleteProduct: async (id: number) => {
        await api.delete(`/api/Product/${id}`);
    }
}; 
