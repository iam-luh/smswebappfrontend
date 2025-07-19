import api from './api';

export interface OrganizationProfile {
    organizationProfileId: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export const organizationProfileService = {
    getAllProfiles: async () => {
        const response = await api.get<OrganizationProfile[]>('/api/OrganizationProfile');
        return response.data;
    },

    getProfileById: async (id: number) => {
        const response = await api.get<OrganizationProfile>(`/api/OrganizationProfile/${id}`);
        return response.data;
    },

    createProfile: async (profile: Omit<OrganizationProfile, 'organizationProfileId' | 'createdAt' | 'updatedAt'>) => {
        const response = await api.post<OrganizationProfile>('/api/OrganizationProfile', profile);
        return response.data;
    },

    updateProfile: async (id: number, profile: Partial<OrganizationProfile>) => {
        const response = await api.put<OrganizationProfile>(`/api/OrganizationProfile/${id}`, profile);
        return response.data;
    },

    deleteProfile: async (id: number) => {
        await api.delete(`/api/OrganizationProfile/${id}`);
    }
}; 