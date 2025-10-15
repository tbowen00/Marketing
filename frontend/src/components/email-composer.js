// Email Composer Component
class EmailComposer {
    constructor() {
        this.contactIds = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('email-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const closeBtn = document.getElementById('close-email-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        const cancelBtn = document.getElementById('cancel-email-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }
    }

    show(contactIds) {
        this.contactIds = contactIds;
        
        const modal = document.getElementById('email-modal');
        if (!modal) return;

        const form = document.getElementById('email-form');
        if (form) {
            form.reset();
        }

        const recipientCount = document.getElementById('recipient-count');
        if (recipientCount) {
            recipientCount.textContent = `${contactIds.length} recipient${contactIds.length > 1 ? 's' : ''}`;
        }

        modal.classList.remove('hidden');
    }

    hide() {
        const modal = document.getElementById('email-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const subject = document.getElementById('email-subject').value;
        const message = document.getElementById('email-message').value;

        if (!subject || !message) {
            showNotification('Please fill in all fields', 'warning');
            return;
        }

        try {
            const response = await API.sendEmail(this.contactIds, subject, message);
            
            if (response.success) {
                showNotification(
                    `Email sent to ${this.contactIds.length} contact${this.contactIds.length > 1 ? 's' : ''}! (Outreach logged)`,
                    'success'
                );
                this.hide();
                
                // Reload contacts if on contacts page
                if (window.contactsPage) {
                    window.contactsPage.loadContacts();
                }
            } else {
                showNotification(response.error || 'Error sending email', 'danger');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showNotification('Error sending email', 'danger');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emailComposer = new EmailComposer();
});
