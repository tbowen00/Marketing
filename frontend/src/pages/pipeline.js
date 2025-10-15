// Pipeline Board Page Controller
class PipelineBoard {
    constructor() {
        this.contacts = [];
        this.stages = ['Lead', 'Contacted', 'Qualified', 'Proposal', 'Converted'];
        this.init();
    }

    init() {
        // Load when page becomes active
    }

    async loadPipeline() {
        try {
            const response = await fetch(`${API_BASE_URL}/contacts`);
            const data = await response.json();
            
            if (data.success) {
                this.contacts = data.contacts;
                this.renderPipeline();
            }
        } catch (error) {
            console.error('Error loading pipeline:', error);
            showNotification('Error loading pipeline', 'danger');
        }
    }

    renderPipeline() {
        const container = document.getElementById('pipeline-board');
        if (!container) return;

        // Group contacts by status
        const contactsByStage = {};
        this.stages.forEach(stage => {
            contactsByStage[stage] = this.contacts.filter(c => c.status === stage);
        });

        container.innerHTML = `
            <div style="padding: 24px;">
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; height: calc(100vh - 180px);">
                    ${this.stages.map(stage => this.renderStage(stage, contactsByStage[stage])).join('')}
                </div>
            </div>
        `;
    }

    renderStage(stage, contacts) {
        return `
            <div style="display: flex; flex-direction: column; background: var(--bg-color); border-radius: var(--radius-lg); padding: 16px; overflow: hidden;">
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 14px; font-weight: 600; text-transform: uppercase; color: var(--text-secondary);">
                        ${stage}
                    </h3>
                    <span style="background: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${contacts.length}
                    </span>
                </div>
                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    ${contacts.length === 0 ? 
                        `<div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 13px;">No contacts</div>` :
                        contacts.map(contact => this.renderCard(contact)).join('')
                    }
                </div>
            </div>
        `;
    }

    renderCard(contact) {
        const hasEmail = contact.email && contact.email.trim() !== '';
        const hasPhone = contact.phone && contact.phone.trim() !== '';
        
        return `
            <div class="pipeline-card" onclick="window.contactsPage.showContactDetail(${contact.id})" style="
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: var(--text-primary);">
                    ${contact.name}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
                    ${contact.company || contact.name}
                </div>
                <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
                    ${hasEmail ? '<i class="fas fa-envelope" style="font-size: 10px; color: var(--success-color);"></i>' : ''}
                    ${hasPhone ? '<i class="fas fa-phone" style="font-size: 10px; color: var(--primary-color);"></i>' : ''}
                    <span class="tier-badge tier-${contact.tier?.toLowerCase() || 'low'}" style="font-size: 10px; padding: 2px 6px;">
                        ${contact.tier || 'Low'}
                    </span>
                </div>
                <div style="font-size: 11px; color: var(--text-secondary);">
                    ${contact.industry || 'Unknown'}
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pipelineBoard = new PipelineBoard();
});
