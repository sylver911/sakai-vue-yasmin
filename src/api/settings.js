import api from '@/api';

export const settingsApi = {
    // Statuses
    statuses: {
        list(params = {}) {
            return api.get('/api/settings/statuses/', params);
        },
        get(id) {
            return api.get(`/api/settings/statuses/${id}/`);
        },
        create(data) {
            return api.post('/api/settings/statuses/', data);
        },
        update(id, data) {
            return api.put(`/api/settings/statuses/${id}/`, data);
        },
        delete(id) {
            return api.delete(`/api/settings/statuses/${id}/`);
        },
        setDefault(id) {
            return api.post(`/api/settings/statuses/${id}/set_default/`, {});
        },
        reorder(items) {
            return api.post('/api/settings/statuses/reorder/', { items });
        },
    },

    // Attachment Types
    attachmentTypes: {
        list(params = {}) {
            return api.get('/api/settings/attachment-types/', params);
        },
        get(id) {
            return api.get(`/api/settings/attachment-types/${id}/`);
        },
        create(data) {
            return api.post('/api/settings/attachment-types/', data);
        },
        update(id, data) {
            return api.put(`/api/settings/attachment-types/${id}/`, data);
        },
        delete(id) {
            return api.delete(`/api/settings/attachment-types/${id}/`);
        },
    },

    // Custom Fields
    customFields: {
        list(params = {}) {
            return api.get('/api/settings/custom-fields/', params);
        },
        get(id) {
            return api.get(`/api/settings/custom-fields/${id}/`);
        },
        create(data) {
            return api.post('/api/settings/custom-fields/', data);
        },
        update(id, data) {
            return api.put(`/api/settings/custom-fields/${id}/`, data);
        },
        delete(id) {
            return api.delete(`/api/settings/custom-fields/${id}/`);
        },
        byTarget(target) {
            return api.get('/api/settings/custom-fields/by_target/', { target });
        },
        fieldTypes() {
            return api.get('/api/settings/custom-fields/field_types/');
        },
        targets() {
            return api.get('/api/settings/custom-fields/targets/');
        },
        reorder(items) {
            return api.post('/api/settings/custom-fields/reorder/', { items });
        },
    },

    // Milestone Templates
    milestoneTemplates: {
        list(params = {}) {
            return api.get('/api/settings/milestone-templates/', params);
        },
        get(id) {
            return api.get(`/api/settings/milestone-templates/${id}/`);
        },
        create(data) {
            return api.post('/api/settings/milestone-templates/', data);
        },
        update(id, data) {
            return api.put(`/api/settings/milestone-templates/${id}/`, data);
        },
        delete(id) {
            return api.delete(`/api/settings/milestone-templates/${id}/`);
        },
        reorder(items) {
            return api.post('/api/settings/milestone-templates/reorder/', { items });
        },
    },
};

export default settingsApi;
