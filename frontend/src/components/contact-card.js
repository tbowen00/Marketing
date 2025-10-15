// Contact Detail Card Component
class ContactCard {
    constructor() {
        this.container = document.getElementById('contact-detail-card');
        this.contact = null;
        this.outreachHistory = [];
        this.notes = [];
        this.showingNoteForm = false;
    }

    show(contact, outreachHistory = [], notes = []) {
        this.contact = contact;
        this.outreachHistory = outreachHistory;
        this.notes = notes;
        this.showingNoteForm = false;
        this.render();
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    render() {
        const hasEmail = this.contact.email && this.contact.email.trim() !== '';
        const hasPhone = this.contact.phone && this.contact.phone.trim() !== '';

        this.container.innerHTML = `
            <div class="modal" style="max-width: 900px;">
                <div class="modal-header">
                    <div>
                        <h2>${this.contact.name}</h2>
                        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
                            ${this.contact.company || ''} ${this.contact.company && this.contact.industry ? '•' : ''} ${this.contact.industry || ''}
                        </p>
                    </div>
                    <button class="modal-close" onclick="window.contactCard.hide()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                        <!-- Main Info -->
                        <div>
                            <!-- Contact Information -->
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h3 style="font-size: 16px; margin-bottom: 16px;">Contact Information</h3>
                                    <div style="display: grid; gap: 12px;">
                                        ${hasEmail ? `
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-envelope" style="color: var(--success-color); width: 20px;"></i>
                                                <span>${this.contact.email}</span>
                                            </div>
                                        ` : ''}
                                        ${hasPhone ? `
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-phone" style="color: var(--primary-color); width: 20px;"></i>
                                                <span>${this.contact.phone}</span>
                                            </div>
                                        ` : ''}
                                        ${this.contact.website_url ? `
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-globe" style="color: var(--text-secondary); width: 20px;"></i>
                                                <a href="${this.contact.website_url}" target="_blank" style="color: var(--primary-color);">${this.contact.website_url}</a>
                                            </div>
                                        ` : ''}
                                        ${this.contact.address ? `
                                            <div style="display: flex; align-items: start; gap: 12px;">
                                                <i class="fas fa-map-marker-alt" style="color: var(--text-secondary); width: 20px; margin-top: 4px;"></i>
                                                <span>${this.contact.address}${this.contact.city ? ', ' + this.contact.city : ''}${this.contact.state ? ', ' + this.contact.state : ''}${this.contact.zip_code ? ' ' + this.contact.zip_code : ''}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Notes -->
                            <div class="card">
                                <div class="card-body">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                        <h3 style="font-size: 16px;">Notes</h3>
                                        ${!this.showingNoteForm ? `
                                            <button class="btn btn-secondary btn-sm" onclick="window.contactCard.showNoteForm()">
                                                <i class="fas fa-plus"></i> Add Note
                                            </button>
                                        ` : ''}
                                    </div>
                                    
                                    ${this.showingNoteForm ? `
                                        <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-color); border-radius: var(--radius-md);">
                                            <textarea 
                                                id="new-note-input" 
                                                rows="3" 
                                                placeholder="Enter your note..."
                                                style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 14px;"
                                            ></textarea>
                                            <div style="display: flex; gap: 8px; margin-top: 8px;">
                                                <button class="btn btn-primary btn-sm" onclick="window.contactCard.saveNote()">
                                                    <i class="fas fa-check"></i> Save
                                                </button>
                                                <button class="btn btn-secondary btn-sm" onclick="window.contactCard.cancelNote()">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <div id="notes-list">
                                        ${this.notes.length > 0 ? this.notes.map(note => `
                                            <div style="padding: 12px; background: var(--bg-color); border-radius: var(--radius-md); margin-bottom: 8px;">
                                                <p style="margin-bottom: 4px;">${note.content}</p>
                                                <p style="font-size: 12px; color: var(--text-secondary);">${new Date(note.created_at).toLocaleString()}</p>
                                            </div>
                                        `).join('') : '<p style="color: var(--text-secondary);">No notes yet</p>'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div>
                            <!-- Quick Stats -->
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h3 style="font-size: 16px; margin-bottom: 16px;">Quick Stats</h3>
                                    <div style="display: grid; gap: 16px;">
                                        <div>
                                            <div style="font-size: 12px; color: var(--text-secondary);">Tier</div>
                                            <span class="tier-badge tier-${this.contact.tier?.toLowerCase() || 'low'}">${this.contact.tier || 'Not Scored'}</span>
                                        </div>
                                        <div>
                                            <div style="font-size: 12px; color: var(--text-secondary);">Status</div>
                                            <span class="status-badge ${this.contact.status.toLowerCase().replace(' ', '-')}">${this.contact.status}</span>
                                        </div>
                                        <div>
                                            <div style="font-size: 12px; color: var(--text-secondary);">Source</div>
                                            <span class="source-badge source-${this.contact.source || 'manual'}">
                                                <i class="fas fa-${this.contact.source === 'google' ? 'google' : 'user'}"></i>
                                                ${this.contact.source || 'manual'}
                                            </span>
                                        </div>
                                        <div>
                                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Total Touches</div>
                                            <div style="font-size: 24px; font-weight: 700;">${this.contact.total_touches}</div>
                                        </div>
                                        ${this.contact.ai_opportunity_score > 0 ? `
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">AI Opportunity</div>
                                                <div style="font-size: 20px; font-weight: 600; color: ${this.contact.ai_opportunity_score > 60 ? 'var(--success-color)' : this.contact.ai_opportunity_score > 30 ? 'var(--warning-color)' : 'var(--text-secondary)'};">
                                                    ${this.contact.ai_opportunity_score > 60 ? 'High' : this.contact.ai_opportunity_score > 30 ? 'Medium' : 'Low'}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="card">
                                <div class="card-body">
                                    <h3 style="font-size: 16px; margin-bottom: 16px;">Actions</h3>
                                    <div style="display: grid; gap: 8px;">
                                        ${hasEmail ? `
                                            <button class="btn btn-primary" style="width: 100%;" onclick="window.contactCard.sendEmail()">
                                                <i class="fas fa-envelope"></i> Send Email
                                            </button>
                                        ` : ''}
                                        ${hasPhone ? `
                                            <button class="btn btn-secondary" style="width: 100%;" onclick="window.contactsPage.callContact('${this.contact.phone}')">
                                                <i class="fas fa-phone"></i> Call
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-secondary" style="width: 100%;" onclick="window.contactCard.editContact()">
                                            <i class="fas fa-edit"></i> Edit Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showNoteForm() {
        this.showingNoteForm = true;
        this.render();
        // Focus the textarea
        setTimeout(() => {
            const textarea = document.getElementById('new-note-input');
            if (textarea) textarea.focus();
        }, 100);
    }

    cancelNote() {
        this.showingNoteForm = false;
        this.render();
    }

    async saveNote() {
        const textarea = document.getElementById('new-note-input');
        const noteContent = textarea ? textarea.value.trim() : '';
        
        if (!noteContent) {
            showNotification('Please enter a note', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/contacts/${this.contact.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: noteContent })
            });
            const data = await response.json();

            if (data.success) {
                showNotification('Note added', 'success');
                // Reload contact details
                const contactResponse = await API.getContact(this.contact.id);
                if (contactResponse.success) {
                    this.show(contactResponse.contact, contactResponse.outreach_history, contactResponse.notes);
                }
            } else {
                showNotification('Error adding note', 'danger');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            showNotification('Error adding note', 'danger');
        }
    }

    sendEmail() {
        this.hide();
        window.emailComposer.show([this.contact.id]);
    }

    editContact() {
        this.hide();
        window.addContactForm.show(this.contact);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.contactCard = new ContactCard();
});
