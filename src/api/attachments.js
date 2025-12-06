import api from '@/api';

export const attachmentsApi = {
    list(params = {}) {
        return api.get('/api/attachments/', params);
    },

    get(id) {
        return api.get(`/api/attachments/${id}/`);
    },

    upload(formData) {
        return api.upload('/api/attachments/', formData);
    },

    update(id, data) {
        return api.put(`/api/attachments/${id}/`, data);
    },

    delete(id) {
        return api.delete(`/api/attachments/${id}/`);
    },

    byCustomer(customerId) {
        return api.get('/api/attachments/by_customer/', { customer: customerId });
    },

    byOrder(orderId) {
        return api.get('/api/attachments/by_order/', { order: orderId });
    },
};

export const tenantsApi = {
    list(params = {}) {
        return api.get('/api/tenants/', params);
    },

    get(id) {
        return api.get(`/api/tenants/${id}/`);
    },

    create(data) {
        return api.post('/api/tenants/', data);
    },

    update(id, data) {
        return api.put(`/api/tenants/${id}/`, data);
    },

    delete(id) {
        return api.delete(`/api/tenants/${id}/`);
    },

    current() {
        return api.get('/api/tenants/current/');
    },

    statistics(id) {
        return api.get(`/api/tenants/${id}/statistics/`);
    },

    toggleActive(id) {
        return api.post(`/api/tenants/${id}/toggle_active/`, {});
    },
};
