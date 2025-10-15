// Campaigns Page Controller - IMPROVED VERSION
class CampaignsPage {
    constructor() {
        this.campaigns = [];
        this.templates = [];
        this.allContacts = [];
        this.selectedContacts = new Set();
        this.selectedTemplate = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const createCampaignBtn = document.getElementById('create-campaign-btn');
        if (createCampaignBtn) {
            createCampaignBtn.addEventListener('click', () => this.showCreateCampaignWizard());
        }
    }

    async loadCampaigns() {
        try {
            const response = await fetch(`${API_BASE_URL}/campaigns`);
            const data = await response.json();
            
            if (data.success) {
                this.campaigns = data.campaigns;
                this.renderCampaigns();
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            showNotification('Error loading campaigns', 'danger');
        }
    }

    renderCampaigns() {
        const container = document.getElementById('campaigns-list');
        if (!container) return;

        if (this.campaigns.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📧</div>
                    <h3>No campaigns yet</h3>
                    <p>Create your first email campaign to start organized outreach</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.campaigns.map(campaign => `
            <div class="card mb-2">
                <div class="card-body" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                        <div style="flex: 1;">
                            <h3 style="font-size: 18px; margin-bottom: 4px;">${campaign.name}</h3>
                            <div style="font-size: 13px; color: var(--text-secondary);">
                                Created ${new Date(campaign.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="window.campaignsPage.deleteCampaign(${campaign.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Sent</div>
                            <div style="font-size: 20px; font-weight: 600;">${campaign.total_sent}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Replied</div>
                            <div style="font-size: 20px; font-weight: 600; color: var(--success-color);">${campaign.total_replied || 0}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Reply Rate</div>
                            <div style="font-size: 20px; font-weight: 600; color: var(--primary-color);">
                                ${campaign.total_sent > 0 ? Math.round((campaign.total_replied / campaign.total_sent) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async showCreateCampaignWizard() {
        // Step 1: Load templates
        try {
            const response = await API.getEmailTemplates();
            if (response.success) {
                this.templates = response.templates;
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }

        // Step 2: Load all contacts with emails
        try {
            const response = await API.getContacts({});
            if (response.success) {
                // Filter to only contacts with valid emails
                this.allContacts = response.contacts.filter(c => c.email && c.email.trim() !== '');
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        }

        this.selectedContacts.clear();
        this.selectedTemplate = null;
        
        this.renderWizard();
        document.getElementById('campaign-wizard-modal').classList.remove('hidden');
    }

    renderWizard() {
        const modal = document.getElementById('campaign-wizard-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal" style="max-width: 900px;">
                <div class="modal-header">
                    <h2>Create Email Campaign</h2>
                    <button class="modal-close" onclick="window.campaignsPage.closeWizard()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Step 1: Campaign Name -->
                    <div class="form-group">
                        <label for="wizard-campaign-name">Campaign Name *</label>
                        <input type="text" id="wizard-campaign-name" placeholder="e.g., Q1 Healthcare Outreach">
                    </div>

                    <!-- Step 2: Select Template -->
                    <div class="form-group">
                        <label>Select Email Template *</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; margin-top: 8px;">
                            ${this.templates.map(template => `
                                <div class="template-card ${this.selectedTemplate?.id === template.id ? 'selected' : ''}" 
                                     onclick="window.campaignsPage.selectTemplate(${template.id})"
                                     style="border: 2px solid ${this.selectedTemplate?.id === template.id ? 'var(--primary-color)' : 'var(--border-color)'}; 
                                            padding: 12px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${template.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Subject: ${template.subject_line}</div>
                                    <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                                        ${template.body.substring(0, 80)}...
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Step 3: Select Recipients -->
                    <div class="form-group">
                        <label>Select Recipients * (${this.selectedContacts.size} selected)</label>
                        <div style="margin-bottom: 12px; display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick="window.campaignsPage.selectAllContacts()">
                                Select All
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="window.campaignsPage.clearAllContacts()">
                                Clear All
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="window.campaignsPage.selectByFilter('High')">
                                High Tier Only
                            </button>
                        </div>
                        <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px;">
                            ${this.allContacts.map(contact => `
                                <label class="checkbox-label" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;"
                                       onmouseover="this.style.background='var(--bg-color)'" 
                                       onmouseout="this.style.background='white'">
                                    <input type="checkbox" 
                                           ${this.selectedContacts.has(contact.id) ? 'checked' : ''}
                                           onchange="window.campaignsPage.toggleContact(${contact.id})"
                                           style="width: 18px; height: 18px; cursor: pointer;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; font-size: 14px;">${contact.name}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">
                                            ${contact.email} • ${contact.company || ''} • ${contact.industry || ''}
                                        </div>
                                    </div>
                                    <span class="tier-badge tier-${contact.tier?.toLowerCase() || 'low'}" style="font-size: 11px;">
                                        ${contact.tier || 'Low'}
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Preview -->
                    ${this.selectedTemplate ? `
                        <div class="alert alert-info">
                            <span class="alert-icon"><i class="fas fa-info-circle"></i></span>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 4px;">Email Preview</div>
                                <div style="font-size: 13px;"><strong>Subject:</strong> ${this.selectedTemplate.subject_line}</div>
                                <div style="font-size: 13px; margin-top: 4px;"><strong>To:</strong> ${this.selectedContacts.size} recipients</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.campaignsPage.closeWizard()">Cancel</button>
                    <button class="btn btn-success" onclick="window.campaignsPage.sendCampaign()" ${!this.selectedTemplate || this.selectedContacts.size === 0 ? 'disabled' : ''}>
                        <i class="fas fa-paper-plane"></i> Send to ${this.selectedContacts.size} Recipients
                    </button>
                </div>
            </div>
        `;
    }

    selectTemplate(templateId) {
        this.selectedTemplate = this.templates.find(t => t.id === templateId);
        this.renderWizard();
    }

    toggleContact(contactId) {
        if (this.selectedContacts.has(contactId)) {
            this.selectedContacts.delete(contactId);
        } else {
            this.selectedContacts.add(contactId);
        }
        this.renderWizard();
    }

    selectAllContacts() {
        this.allContacts.forEach(c => this.selectedContacts.add(c.id));
        this.renderWizard();
    }

    clearAllContacts() {
        this.selectedContacts.clear();
        this.renderWizard();
    }

    selectByFilter(tier) {
        this.selectedContacts.clear();
        this.allContacts.filter(c => c.tier === tier).forEach(c => this.selectedContacts.add(c.id));
        this.renderWizard();
    }

    async sendCampaign() {
        const campaignName = document.getElementById('wizard-campaign-name')?.value?.trim();
        
        if (!campaignName) {
            showNotification('Please enter a campaign name', 'warning');
            return;
        }

        if (!this.selectedTemplate) {
            showNotification('Please select a template', 'warning');
            return;
        }

        if (this.selectedContacts.size === 0) {
            showNotification('Please select at least one recipient', 'warning');
            return;
        }

        const confirmed = await window.customConfirm(
            `Send emails to ${this.selectedContacts.size} recipients using "${this.selectedTemplate.name}" template?`,
            'Confirm Send Campaign'
        );

        if (!confirmed) return;

        try {
            showNotification(`Sending campaign to ${this.selectedContacts.size} recipients...`, 'info');

            // Create campaign record
            const campaignResponse = await fetch(`${API_BASE_URL}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignName,
                    subject_lines: [this.selectedTemplate.subject_line],
                    email_body: this.selectedTemplate.body,
                    target_industries: [],
                    target_tiers: [],
                    target_sources: [],
                    daily_limit: this.selectedContacts.size
                })
            });

            const campaignData = await campaignResponse.json();

            if (!campaignData.success) {
                throw new Error('Failed to create campaign');
            }

            // Send emails using the email service
            const contactIds = Array.from(this.selectedContacts);
            const emailResponse = await fetch(`${API_BASE_URL}/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contact_ids: contactIds,
                    subject: this.selectedTemplate.subject_line,
                    body_html: this.selectedTemplate.body,
                    body_text: this.selectedTemplate.body
                })
            });

            const emailData = await emailResponse.json();

            if (emailData.success) {
                const results = emailData.results;
                showNotification(
                    `✓ Campaign sent! ${results.sent} emails sent successfully` +
                    (results.failed > 0 ? `, ${results.failed} failed` : ''),
                    results.failed > 0 ? 'warning' : 'success'
                );
                
                this.closeWizard();
                this.loadCampaigns();

                // Reload contacts page if it's open
                if (window.contactsPage) {
                    window.contactsPage.loadContacts();
                }
            } else {
                throw new Error(emailData.error || 'Failed to send emails');
            }

        } catch (error) {
            console.error('Error sending campaign:', error);
            showNotification('Error sending campaign: ' + error.message, 'danger');
        }
    }

    closeWizard() {
        const modal = document.getElementById('campaign-wizard-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.selectedContacts.clear();
        this.selectedTemplate = null;
    }

    async deleteCampaign(campaignId) {
        const confirmed = await window.customConfirm(
            'Delete this campaign? This cannot be undone.',
            'Delete Campaign'
        );
        
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                showNotification('Campaign deleted', 'success');
                this.loadCampaigns();
            } else {
                showNotification('Error deleting campaign', 'danger');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            showNotification('Error deleting campaign', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.campaignsPage = new CampaignsPage();
});