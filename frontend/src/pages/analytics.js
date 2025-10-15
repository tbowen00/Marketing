// Analytics Page Controller
class AnalyticsPage {
    constructor() {
        this.stats = null;
        this.industryPerformance = null;
        this.sourcePerformance = null;
        this.init();
    }

    init() {
        // Will load when page is shown
    }

    async loadAnalytics() {
        try {
            // Load all analytics data
            const [statsResponse, industryResponse, sourceResponse] = await Promise.all([
                API.getDashboardAnalytics(),
                API.getIndustryPerformance(),
                API.getSourcePerformance()
            ]);

            if (statsResponse.success) {
                this.stats = statsResponse.stats;
            }
            if (industryResponse.success) {
                this.industryPerformance = industryResponse.performance;
            }
            if (sourceResponse.success) {
                this.sourcePerformance = sourceResponse.performance;
            }

            this.renderAnalytics();
        } catch (error) {
            console.error('Error loading analytics:', error);
            showNotification('Error loading analytics', 'danger');
        }
    }

    renderAnalytics() {
        const container = document.getElementById('analytics-content');
        if (!container) return;

        container.innerHTML = `
            <h2 style="margin-bottom: 24px;">Lead Generation Analytics</h2>
            
            <!-- Key Metrics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Leads</div>
                    <div class="stat-value">${this.stats?.total_contacts || 0}</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        ${this.stats?.with_email || 0} with email (${this.stats?.email_percentage || 0}%)
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Reply Rate</div>
                    <div class="stat-value">${this.stats?.reply_rate || 0}%</div>
                    <div class="stat-change ${this.stats?.reply_rate > 10 ? 'positive' : ''}">
                        ${this.stats?.total_replied || 0} replied
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Conversion Rate</div>
                    <div class="stat-value">${this.stats?.conversion_rate || 0}%</div>
                    <div class="stat-change ${this.stats?.conversion_rate > 5 ? 'positive' : ''}">
                        ${this.stats?.total_converted || 0} converted
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">High AI Opportunity</div>
                    <div class="stat-value">${this.stats?.high_ai_opportunity || 0}</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        Leads with strong AI signals
                    </div>
                </div>
            </div>

            <!-- Tier & Source Breakdown -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 32px;">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Leads by Tier</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderTierBreakdown()}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Leads by Source</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderSourceBreakdown()}
                    </div>
                </div>
            </div>

            <!-- Industry Performance -->
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">Industry Performance</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                        Which industries respond best to outreach
                    </p>
                </div>
                <div class="card-body">
                    ${this.renderIndustryPerformance()}
                </div>
            </div>

            <!-- Source Performance Comparison -->
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">Source Performance: Google vs Yelp</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                        Compare lead quality across discovery sources
                    </p>
                </div>
                <div class="card-body">
                    ${this.renderSourceComparison()}
                </div>
            </div>

            <!-- Campaign Stats -->
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">Campaign Activity</h3>
                </div>
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Active Campaigns</div>
                            <div class="info-value">${this.stats?.active_campaigns || 0}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Total Emails Sent</div>
                            <div class="info-value">${this.stats?.total_campaign_sends || 0}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Avg. Daily Send</div>
                            <div class="info-value">30</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTierBreakdown() {
        if (!this.stats?.tier_breakdown) return '<p>No data</p>';

        const tiers = ['High', 'Medium', 'Low'];
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${tiers.map(tier => {
                    const count = this.stats.tier_breakdown[tier] || 0;
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-color); border-radius: var(--radius-md);">
                            <span class="tier-badge tier-${tier.toLowerCase()}">${tier}</span>
                            <span style="font-weight: 600; font-size: 18px;">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderSourceBreakdown() {
        if (!this.stats?.source_breakdown) return '<p>No data</p>';

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${Object.entries(this.stats.source_breakdown).map(([source, count]) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-color); border-radius: var(--radius-md);">
                        <span class="source-badge source-${source}">${source}</span>
                        <span style="font-weight: 600; font-size: 18px;">${count}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderIndustryPerformance() {
        if (!this.industryPerformance || this.industryPerformance.length === 0) {
            return '<p>No industry data yet. Start contacting leads to see performance.</p>';
        }

        return `
            <table class="contacts-table">
                <thead>
                    <tr>
                        <th>Industry</th>
                        <th>Total Leads</th>
                        <th>Contacted</th>
                        <th>Reply Rate</th>
                        <th>Conversion Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.industryPerformance.map(item => `
                        <tr>
                            <td style="font-weight: 500;">${item.industry}</td>
                            <td>${item.total}</td>
                            <td>${item.contacted}</td>
                            <td>
                                <span style="color: ${item.reply_rate > 10 ? 'var(--success-color)' : 'var(--text-primary)'}; font-weight: 600;">
                                    ${item.reply_rate}%
                                </span>
                            </td>
                            <td>
                                <span style="color: ${item.conversion_rate > 5 ? 'var(--success-color)' : 'var(--text-primary)'}; font-weight: 600;">
                                    ${item.conversion_rate}%
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderSourceComparison() {
        if (!this.sourcePerformance || this.sourcePerformance.length === 0) {
            return '<p>No source comparison data yet.</p>';
        }

        return `
            <table class="contacts-table">
                <thead>
                    <tr>
                        <th>Source</th>
                        <th>Total Leads</th>
                        <th>Email Rate</th>
                        <th>Reply Rate</th>
                        <th>Avg Health Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.sourcePerformance.map(item => `
                        <tr>
                            <td><span class="source-badge source-${item.source}">${item.source}</span></td>
                            <td>${item.total}</td>
                            <td>${item.email_rate}%</td>
                            <td>${item.reply_rate}%</td>
                            <td>${item.avg_health_score || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsPage = new AnalyticsPage();
});
