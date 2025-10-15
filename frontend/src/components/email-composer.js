// Email Composer Component
class EmailComposer {
    constructor() {
        this.contactIds = [];
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        const modal = document.getElementById('email-composer-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">
                    <h2>Compose Email</h2>
                    <button class="modal-close" onclick="window.emailComposer.close()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>To</label>
                        <div id="recipient-list" style="padding: 10px; background: var(--bg-color); border-radius: var(--radius-md); font-size: 14px; color: var(--text-secondary);">
                            No recipients selected
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email-subject">Subject *</label>
                        <input type="text" id="email-subject" placeholder="Enter email subject">
                    </div>

                    <div class="form-group">
                        <label for="email-body">Message *</label>
                        <textarea id="email-body" rows="12" placeholder="Write your email message here..."></textarea>
                        <small style="color: var(--text-secondary); font-size: 12px; display: block; margin-top: 8px;">
                            <i class="fas fa-magic"></i> Use personalization: {{name}}, {{company}}, {{industry}}
                        </small>
                    </div>

                    <div class="alert alert-info">
                        <span class="alert-icon"><i class="fas fa-info-circle"></i></span>
                        <span style="font-size: 13px;">
                            Emails will be sent from: <strong>hello@everlystudio.co</strong>
                        </span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.emailComposer.close()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.emailComposer.send()">
                        <i class="fas fa-paper-plane"></i> Send Email
                    </button>
                </div>
            </div>
        `;
    }

    async show(contactIds) {
        this.contactIds = contactIds;
        
        // Load contact details
        try {
            const response = await fetch('http://localhost:5001/api/contacts');
            const data = await response.json();
            
            if (data.success) {
                const selectedContacts = data.contacts.filter(c => contactIds.includes(c.id));
                const recipientList = document.getElementById('recipient-list');
                
                if (recipientList && selectedContacts.length > 0) {
                    recipientList.innerHTML = selectedContacts
                        .filter(c => c.email && c.email.trim() !== '')
                        .map(c => `<div style="margin-bottom: 4px;"><i class="fas fa-user"></i> ${c.name} (${c.email})</div>`)
                        .join('');
                }
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        }

        const modal = document.getElementById('email-composer-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Clear form
        document.getElementById('email-subject').value = '';
        document.getElementById('email-body').value = '';
    }

    close() {
        const modal = document.getElementById('email-composer-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.contactIds = [];
    }

    async send() {
        const subject = document.getElementById('email-subject').value.trim();
        const body = document.getElementById('email-body').value.trim();

        if (!subject || !body) {
            showNotification('Please fill in subject and message', 'warning');
            return;
        }

        if (this.contactIds.length === 0) {
            showNotification('No recipients selected', 'warning');
            return;
        }

        // Confirm before sending
        const confirmed = await window.customConfirm(
            `Send this email to ${this.contactIds.length} contact${this.contactIds.length > 1 ? 's' : ''}?`,
            'Confirm Send'
        );

        if (!confirmed) return;

        try {
            showNotification('Sending emails...', 'info');

            // Personalize email body with basic HTML formatting
            const bodyHtml = this.formatEmailBody(body);
            const bodyText = body; // Plain text version

            const response = await fetch('http://localhost:5001/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact_ids: this.contactIds,
                    subject: subject,
                    body_html: bodyHtml,
                    body_text: bodyText
                })
            });

            const data = await response.json();

            if (data.success) {
                const results = data.results;
                showNotification(
                    `Successfully sent ${results.sent} email${results.sent !== 1 ? 's' : ''}!` +
                    (results.failed > 0 ? ` (${results.failed} failed)` : ''),
                    results.failed > 0 ? 'warning' : 'success'
                );
                
                this.close();
                
                // Reload contacts to update touch counts
                if (window.contactsPage) {
                    window.contactsPage.loadContacts();
                }
            } else {
                showNotification(data.error || 'Error sending emails', 'danger');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showNotification('Error sending emails', 'danger');
        }
    }

    formatEmailBody(text) {
        // Convert plain text to HTML with basic formatting
        // Preserve line breaks and add basic styling
        return `
            <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
                ${text
                    .split('\n\n')
                    .map(para => `<p style="margin: 0 0 16px 0;">${para.replace(/\n/g, '<br>')}</p>`)
                    .join('')}
                <br>
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <strong>Everly Studio</strong><br>
                    AI-Powered Web Solutions<br>
                    <a href="mailto:hello@everlystudio.co" style="color: #6366f1;">hello@everlystudio.co</a>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.emailComposer = new EmailComposer();
});
