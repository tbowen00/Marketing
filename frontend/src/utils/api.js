// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

// API Helper Functions
const API = {
    // Contacts
    async getContacts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/contacts?${params}`);
        return await response.json();
    },

    async getContact(id) {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`);
        return await response.json();
    },

    async createContact(data) {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async updateContact(id, data) {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deleteContact(id) {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    },

    async addNote(contactId, content) {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        return await response.json();
    },

    async checkDuplicate(data) {
        const response = await fetch(`${API_BASE_URL}/contacts/check-duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // Analytics
    async getDashboardAnalytics() {
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`);
        return await response.json();
    },

    async getIndustryPerformance() {
        const response = await fetch(`${API_BASE_URL}/analytics/industry-performance`);
        return await response.json();
    },

    async getSourcePerformance() {
        const response = await fetch(`${API_BASE_URL}/analytics/source-performance`);
        return await response.json();
    },

    // Email
    async sendEmail(contactIds, subject, message) {
        const response = await fetch(`${API_BASE_URL}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact_ids: contactIds, subject, message })
        });
        return await response.json();
    },

    async logTouch(contactId, outreachType, notes) {
        const response = await fetch(`${API_BASE_URL}/email/log-touch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact_id: contactId, outreach_type: outreachType, notes })
        });
        return await response.json();
    },

    // Filters
    async getFilterOptions() {
        const response = await fetch(`${API_BASE_URL}/filters/options`);
        return await response.json();
    },

    // Lead Discovery
    async getDiscoveryJobs() {
        const response = await fetch(`${API_BASE_URL}/lead-discovery/jobs`);
        return await response.json();
    },

    async createDiscoveryJob(data) {
        const response = await fetch(`${API_BASE_URL}/lead-discovery/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async runDiscoveryJob(jobId) {
        const response = await fetch(`${API_BASE_URL}/lead-discovery/jobs/${jobId}/run`, {
            method: 'POST'
        });
        return await response.json();
    },

    async enrichLeads(batchSize = 10) {
        const response = await fetch(`${API_BASE_URL}/lead-discovery/enrich`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batch_size: batchSize })
        });
        return await response.json();
    },

    // Campaigns
    async getCampaigns() {
        const response = await fetch(`${API_BASE_URL}/campaigns`);
        return await response.json();
    },

    async createCampaign(data) {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async getCampaignRecipients(campaignId) {
        const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/recipients`);
        return await response.json();
    },

    async previewCampaign(campaignId) {
        const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/preview`);
        return response.blob();
    },

    async sendCampaign(campaignId, batchSize, previewMode = true) {
        const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batch_size: batchSize, preview_mode: previewMode })
        });
        return await response.json();
    },

    async updateCampaign(campaignId, data) {
        const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};
