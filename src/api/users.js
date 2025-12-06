import api from '@/api';

export const usersApi = {
    list(params = {}) {
        return api.get('/api/auth/users/', params);
    },

    get(id) {
        return api.get(`/api/auth/users/${id}/`);
    },

    create(data) {
        return api.post('/api/auth/users/', data);
    },

    update(id, data) {
        return api.put(`/api/auth/users/${id}/`, data);
    },

    delete(id) {
        return api.delete(`/api/auth/users/${id}/`);
    },

    toggleActive(id) {
        return api.post(`/api/auth/users/${id}/toggle_active/`, {});
    },

    changeRole(id, role) {
        return api.post(`/api/auth/users/${id}/change_role/`, { role });
    },

    dropdown() {
        return api.get('/api/auth/users/dropdown/');
    },
};

export const activityLogsApi = {
    list(params = {}) {
        return api.get('/api/auth/activity-logs/', params);
    },

    get(id) {
        return api.get(`/api/auth/activity-logs/${id}/`);
    },

    byEntity(entityType, entityId) {
        return api.get('/api/auth/activity-logs/by_entity/', {
            entity_type: entityType,
            entity_id: entityId,
        });
    },

    myActivities() {
        return api.get('/api/auth/activity-logs/my_activities/');
    },
};

export default usersApi;
