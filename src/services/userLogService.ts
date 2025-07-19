import api from './api';

export interface UserLog {
    logId: number;
    userId: number;
    action: string;
    actionTime: string;
    details?: string;
    ipAddress?: string;
}

export const userLogService = {
    getAllLogs: async () => {
        const response = await api.get<UserLog[]>('/api/UserLog');
        return response.data;
    },

    getLogById: async (id: number) => {
        const response = await api.get<UserLog>(`/api/UserLog/${id}`);
        return response.data;
    },

    getLogsByUserId: async (userId: number) => {
        const response = await api.get<UserLog[]>(`/api/UserLog/user/${userId}`);
        return response.data;
    },

    createLog: async (log: Omit<UserLog, 'logId' | 'actionTime'>) => {
        const response = await api.post<UserLog>('/api/UserLog', log);
        return response.data;
    }
}; 