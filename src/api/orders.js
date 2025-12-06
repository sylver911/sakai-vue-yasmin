import api from '@/api';

export const ordersApi = {
    list(params = {}) {
        return api.get('/api/orders/', params);
    },

    get(id) {
        return api.get(`/api/orders/${id}/`);
    },

    create(data) {
        return api.post('/api/orders/', data);
    },

    update(id, data) {
        return api.put(`/api/orders/${id}/`, data);
    },

    patch(id, data) {
        return api.patch(`/api/orders/${id}/`, data);
    },

    delete(id) {
        return api.delete(`/api/orders/${id}/`);
    },

    changeStatus(id, statusId, notes = '') {
        return api.post(`/api/orders/${id}/change_status/`, {
            status: statusId,
            status_notes: notes,
        });
    },

    calendar() {
        return api.get('/api/orders/calendar/');
    },

    statistics() {
        return api.get('/api/orders/statistics/');
    },

    // Order Items
    items: {
        list(orderId) {
            return api.get(`/api/orders/${orderId}/items/`);
        },
        create(orderId, data) {
            return api.post(`/api/orders/${orderId}/items/`, data);
        },
        update(orderId, itemId, data) {
            return api.put(`/api/orders/${orderId}/items/${itemId}/`, data);
        },
        delete(orderId, itemId) {
            return api.delete(`/api/orders/${orderId}/items/${itemId}/`);
        },
    },

    // Comments
    comments: {
        list(orderId) {
            return api.get(`/api/orders/${orderId}/comments/`);
        },
        create(orderId, data) {
            return api.post(`/api/orders/${orderId}/comments/`, data);
        },
        update(orderId, commentId, data) {
            return api.put(`/api/orders/${orderId}/comments/${commentId}/`, data);
        },
        delete(orderId, commentId) {
            return api.delete(`/api/orders/${orderId}/comments/${commentId}/`);
        },
    },

    // Milestones
    milestones: {
        list(orderId) {
            return api.get(`/api/orders/${orderId}/milestones/`);
        },
        create(orderId, data) {
            return api.post(`/api/orders/${orderId}/milestones/`, data);
        },
        update(orderId, milestoneId, data) {
            return api.put(`/api/orders/${orderId}/milestones/${milestoneId}/`, data);
        },
        delete(orderId, milestoneId) {
            return api.delete(`/api/orders/${orderId}/milestones/${milestoneId}/`);
        },
        complete(orderId, milestoneId) {
            return api.post(`/api/orders/${orderId}/milestones/${milestoneId}/complete/`, {});
        },
        uncomplete(orderId, milestoneId) {
            return api.post(`/api/orders/${orderId}/milestones/${milestoneId}/uncomplete/`, {});
        },
        upcoming() {
            return api.get('/api/orders/milestones/upcoming/');
        },
        listAll(params = {}) {
            return api.get('/api/orders/milestones/', params);
        },
    },
};

export default ordersApi;
