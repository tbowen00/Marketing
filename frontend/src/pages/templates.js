// Email Templates Page Controller
class TemplatesPage {
    constructor() {
        this.templates = [];
        this.editingTemplate = null;
        this.init();
    }

    init() {
        // Load when page becomes active
    }

    async loadContent() {
        try {
            const response = await API.getEmailTemplates();
            if (response.success) {
                this.templates = response.templates;
                this.renderTemplates();
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            showNotification('Error loading templates', 'danger');
        }
    }

    renderTemplates() {
        const container = document.getElementById('templates-content');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 24px; max-width: 1200px;">
                <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                    <p style="color: var(--text-secondary);">Pre-written email templates for your campaigns</p>
                    <button class="btn btn-primary" onclick="window.templatesPage.showCreateModal()">
                        <i class="fas fa-plus"></i> New Template
                    </button>
                </div>

                ${this.templates.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>No templates yet</h3>
                        <p>Create your first email template</p>
                    </div>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                        ${this.templates.map(template => this.renderTemplateCard(template)).join('')}
                    </div>
                `}
            </div>

            <!-- Create/Edit Template Modal -->
            <div id="template-modal" class="modal-overlay hidden">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 id="template-modal-title">Create Template</h2>
                        <button class="modal-close" onclick="window.templatesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="template-name">Template Name *</label>
                            <input type="text" id="template-name" placeholder="e.g., AI Services Pitch">
                        </div>

                        <div class="form-group">
                            <label for="template-subject">Subject Line *</label>
                            <input type="text" id="template-subject" placeholder="Transform {{company}} with AI">
                        </div>

                        <div class="form-group">
                            <label for="template-body">Email Body *</label>
                            <textarea id="template-body" rows="12" placeholder="Hi {{name}},

I noticed {{company}}..."></textarea>
                            <small style="color: var(--text-secondary); font-size: 12px;">
                                <i class="fas fa-magic"></i> Use: {{name}}, {{company}}, {{industry}}
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.templatesPage.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="window.templatesPage.saveTemplate()">
                            <i class="fas fa-save"></i> Save Template
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplateCard(template) {
        return `
            <div class="card" style="height: 100%;">
                <div class="card-body" style="display: flex; flex-direction: column; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <h3 style="font-size: 16px; font-weight: 600; flex: 1;">${template.name}</h3>
                        ${template.is_default ? '<span class="tier-badge tier-high" style="font-size: 10px;">DEFAULT</span>' : ''}
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Subject:</div>
                        <div style="font-size: 13px; font-weight: 500;">${template.subject_line}</div>
                    </div>

                    <div style="flex: 1; margin-bottom: 12px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Preview:</div>
                        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; max-height: 100px; overflow: hidden;">
                            ${template.body.substring(0, 150)}...
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: auto;">
                        ${!template.is_default ? `
                            <button class="btn btn-secondary btn-sm" onclick="window.templatesPage.editTemplate(${template.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.templatesPage.deleteTemplate(${template.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : '<span style="font-size: 12px; color: var(--text-secondary);">Default templates cannot be edited</span>'}
                    </div>
                </div>
            </div>
        `;
    }

    showCreateModal() {
        this.editingTemplate = null;
        document.getElementById('template-modal-title').textContent = 'Create Template';
        document.getElementById('template-name').value = '';
        document.getElementById('template-subject').value = '';
        document.getElementById('template-body').value = '';
        document.getElementById('template-modal').classList.remove('hidden');
    }

    editTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        this.editingTemplate = template;
        document.getElementById('template-modal-title').textContent = 'Edit Template';
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-subject').value = template.subject_line;
        document.getElementById('template-body').value = template.body;
        document.getElementById('template-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('template-modal').classList.add('hidden');
        this.editingTemplate = null;
    }

    async saveTemplate() {
        const name = document.getElementById('template-name').value.trim();
        const subject = document.getElementById('template-subject').value.trim();
        const body = document.getElementById('template-body').value.trim();

        if (!name || !subject || !body) {
            showNotification('Please fill in all fields', 'warning');
            return;
        }

        try {
            let response;
            if (this.editingTemplate) {
                // Update existing
                response = await API.updateEmailTemplate(this.editingTemplate.id, {
                    name, subject_line: subject, body
                });
            } else {
                // Create new
                response = await API.createEmailTemplate({
                    name, subject_line: subject, body, category: 'custom'
                });
            }

            if (response.success) {
                showNotification(this.editingTemplate ? 'Template updated!' : 'Template created!', 'success');
                this.closeModal();
                this.loadContent();
            } else {
                showNotification(response.error || 'Error saving template', 'danger');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            showNotification('Error saving template', 'danger');
        }
    }

    async deleteTemplate(templateId) {
        const confirmed = await window.customConfirm(
            'Are you sure you want to delete this template?',
            'Delete Template'
        );
        
        if (!confirmed) return;

        try {
            const response = await API.deleteEmailTemplate(templateId);
            
            if (response.success) {
                showNotification('Template deleted', 'success');
                this.loadContent();
            } else {
                showNotification(response.error || 'Error deleting template', 'danger');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            showNotification('Error deleting template', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.templatesPage = new TemplatesPage();
});
