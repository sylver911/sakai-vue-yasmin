import api from '@/api';

export const customersApi = {
    // List customers with filters
    list(params = {}) {
        return api.get('/api/customers/', params);
    },

    // Get customer details
    get(id) {
        return api.get(`/api/customers/${id}/`);
    },

    // Create customer
    create(data) {
        return api.post('/api/customers/', data);
    },

    // Update customer
    update(id, data) {
        return api.put(`/api/customers/${id}/`, data);
    },

    // Partial update
    patch(id, data) {
        return api.patch(`/api/customers/${id}/`, data);
    },

    // Delete customer
    delete(id) {
        return api.delete(`/api/customers/${id}/`);
    },

    // Get dropdown list
    dropdown() {
        return api.get('/api/customers/dropdown/');
    },

    // Get statistics
    statistics() {
        return api.get('/api/customers/statistics/');
    },

    // Get customer orders
    orders(id) {
        return api.get(`/api/customers/${id}/orders/`);
    },

    // Get customer activity
    activity(id) {
        return api.get(`/api/customers/${id}/activity/`);
    },

    // Addresses
    addresses: {
        list(customerId) {
            return api.get(`/api/customers/${customerId}/addresses/`);
        },
        create(customerId, data) {
            return api.post(`/api/customers/${customerId}/addresses/`, data);
        },
        update(customerId, addressId, data) {
            return api.put(`/api/customers/${customerId}/addresses/${addressId}/`, data);
        },
        delete(customerId, addressId) {
            return api.delete(`/api/customers/${customerId}/addresses/${addressId}/`);
        },
    },

    // Contacts
    contacts: {
        list(customerId) {
            return api.get(`/api/customers/${customerId}/contacts/`);
        },
        create(customerId, data) {
            return api.post(`/api/customers/${customerId}/contacts/`, data);
        },
        update(customerId, contactId, data) {
            return api.put(`/api/customers/${customerId}/contacts/${contactId}/`, data);
        },
        delete(customerId, contactId) {
            return api.delete(`/api/customers/${customerId}/contacts/${contactId}/`);
        },
    },

    // Contact Persons (for business customers)
    contactPersons: {
        list(customerId) {
            return api.get(`/api/customers/${customerId}/contact-persons/`);
        },
        create(customerId, data) {
            return api.post(`/api/customers/${customerId}/contact-persons/`, data);
        },
        update(customerId, personId, data) {
            return api.put(`/api/customers/${customerId}/contact-persons/${personId}/`, data);
        },
        delete(customerId, personId) {
            return api.delete(`/api/customers/${customerId}/contact-persons/${personId}/`);
        },
    },
};

export default customersApi;
