// Campaigns Page Controller
class CampaignsPage {
    constructor() {
        this.campaigns = [];
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
                    <p>Create your first email campaign</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.campaigns.map(campaign => `
            <div class="card mb-2">
                <div class="card-body" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h3 style="font-size: 18px; margin-bottom: 8px;">${campaign.name}</h3>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 12px;">
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
                                    <div style="font-size: 12px; color: var(--text-secondary);">Status</div>
                                    <div style="margin-top: 4px;">
                                        <span class="status-badge ${campaign.is_active ? 'qualified' : 'not-interested'}">
                                            ${campaign.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick="window.campaignsPage.previewCampaign(${campaign.id})">
                                Preview CSV
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="window.campaignsPage.sendCampaign(${campaign.id})">
                                Send Batch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showCreateCampaignModal() {
        const modal = document.getElementById('create-campaign-modal');
        if (modal) {
            modal.classList.remove('hidden');
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
        const confirmed = confirm('This will send emails to the next batch of recipients. Continue?');
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.campaignsPage = new CampaignsPage();
});
