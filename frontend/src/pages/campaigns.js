// Campaigns Page Controller
class CampaignsPage {
    constructor() {
        this.campaigns = [];
        this.templates = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const createCampaignBtn = document.getElementById('create-campaign-btn');
        if (createCampaignBtn) {
            createCampaignBtn.addEventListener('click', () => this.showCreateCampaignModal());
        }
    }

    async loadCampaigns() {
        try {
            const response = await API.getCampaigns();
            if (response.success) {
                this.campaigns = response.campaigns;
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
                    <p>Create your first email campaign to start sending organized outreach</p>
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
                        <div style="display: flex; gap: 8px;">
                            <span class="status-badge ${campaign.is_active ? 'qualified' : 'not-interested'}">
                                ${campaign.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button class="btn btn-secondary btn-sm" onclick="window.campaignsPage.previewCampaign(${campaign.id})">
                                <i class="fas fa-eye"></i> Preview
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="window.campaignsPage.sendCampaign(${campaign.id})">
                                <i class="fas fa-paper-plane"></i> Send Batch
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.campaignsPage.deleteCampaign(${campaign.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Sent</div>
                            <div style="font-size: 20px; font-weight: 600;">${campaign.total_sent}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Replied</div>
                            <div style="font-size: 20px; font-weight: 600; color: var(--success-color);">${campaign.total_replied}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Daily Limit</div>
                            <div style="font-size: 20px; font-weight: 600;">${campaign.daily_limit}</div>
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

    async showCreateCampaignModal() {
        // Load templates first
        try {
            const response = await API.getEmailTemplates();
            if (response.success) {
                this.templates = response.templates;
                
                // Populate template dropdown
                const selector = document.getElementById('template-selector');
                if (selector) {
                    selector.innerHTML = '<option value="">-- Start from scratch --</option>' +
                        this.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
                }
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }

        const modal = document.getElementById('create-campaign-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    loadTemplate(templateId) {
        if (!templateId) {
            // Clear form
            document.getElementById('campaign-subjects').value = '';
            document.getElementById('campaign-body').value = '';
            return;
        }

        const template = this.templates.find(t => t.id == templateId);
        if (template) {
            document.getElementById('campaign-subjects').value = template.subject_line;
            document.getElementById('campaign-body').value = template.body;
            showNotification('Template loaded!', 'success');
        }
    }

    async createCampaign() {
        const name = document.getElementById('campaign-name').value;
        const subjectLines = document.getElementById('campaign-subjects').value.split('\n').filter(s => s.trim());
        const emailBody = document.getElementById('campaign-body').value;
        const dailyLimit = document.getElementById('campaign-daily-limit').value;

        const targetIndustries = Array.from(document.querySelectorAll('input[name="campaign-industries"]:checked')).map(cb => cb.value);
        const targetTiers = Array.from(document.querySelectorAll('input[name="campaign-tiers"]:checked')).map(cb => cb.value);

        if (!name || subjectLines.length === 0 || !emailBody) {
            showNotification('Please fill in all required fields', 'warning');
            return;
        }

        try {
            const response = await API.createCampaign({
                name: name,
                subject_lines: subjectLines,
                email_body: emailBody,
                target_industries: targetIndustries,
                target_tiers: targetTiers,
                target_sources: ['google', 'yelp'],
                daily_limit: parseInt(dailyLimit)
            });

            if (response.success) {
                showNotification('Campaign created!', 'success');
                document.getElementById('create-campaign-modal').classList.add('hidden');
                
                // Clear form
                document.getElementById('campaign-name').value = '';
                document.getElementById('campaign-subjects').value = '';
                document.getElementById('campaign-body').value = '';
                document.getElementById('template-selector').value = '';
                
                this.loadCampaigns();
            } else {
                showNotification(response.error || 'Error creating campaign', 'danger');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            showNotification('Error creating campaign', 'danger');
        }
    }

    async previewCampaign(campaignId) {
        try {
            const blob = await API.previewCampaign(campaignId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaign_${campaignId}_preview.csv`;
            a.click();
            showNotification('Preview CSV downloaded', 'success');
        } catch (error) {
            console.error('Error downloading preview:', error);
            showNotification('Error downloading preview', 'danger');
        }
    }

    async sendCampaign(campaignId) {
        const confirmed = await window.customConfirm(
            'This will send the next batch of emails based on your daily limit. Continue?',
            'Send Campaign Batch'
        );
        
        if (!confirmed) return;

        try {
            const response = await API.sendCampaign(campaignId, null, false);
            
            if (response.success) {
                showNotification(`Sent ${response.sent} emails`, 'success');
                this.loadCampaigns();
            } else {
                showNotification(response.error || 'Error sending campaign', 'danger');
            }
        } catch (error) {
            console.error('Error sending campaign:', error);
            showNotification('Error sending campaign', 'danger');
        }
    }

    async deleteCampaign(campaignId) {
        const confirmed = await window.customConfirm(
            'Are you sure you want to delete this campaign? This cannot be undone.',
            'Delete Campaign'
        );
        
        if (!confirmed) return;

        try {
            const response = await API.deleteCampaign(campaignId);
            
            if (response.success) {
                showNotification('Campaign deleted', 'success');
                this.loadCampaigns();
            } else {
                showNotification(response.error || 'Error deleting campaign', 'danger');
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
