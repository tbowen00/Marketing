// Add/Edit Contact Form Component
class AddContactForm {
    constructor() {
        this.isEditMode = false;
        this.editingContactId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Email duplicate check
        const emailInput = document.getElementById('contact-email');
        if (emailInput) {
            emailInput.addEventListener('blur', debounce(async (e) => {
                await this.checkDuplicate(e.target.value);
            }, 500));
        }

        // Close modal
        const closeBtn = document.getElementById('close-contact-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-contact-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }
    }

    show(contact = null) {
        const modal = document.getElementById('add-contact-modal');
        const title = document.getElementById('contact-modal-title');
        const form = document.getElementById('contact-form');
        
        if (!modal || !form) return;

        this.isEditMode = !!contact;
        this.editingContactId = contact ? contact.id : null;

        // Update title
        if (title) {
            title.textContent = this.isEditMode ? 'Edit Contact' : 'Add New Contact';
        }

        // Populate form
        if (this.isEditMode && contact) {
            document.getElementById('contact-name').value = contact.name || '';
            document.getElementById('contact-email').value = contact.email || '';
            document.getElementById('contact-phone').value = contact.phone || '';
            document.getElementById('contact-company').value = contact.company || '';
            document.getElementById('contact-job-title').value = contact.job_title || '';
            document.getElementById('contact-job-category').value = contact.job_category || '';
            document.getElementById('contact-status').value = contact.status || 'Lead';
        } else {
            form.reset();
        }

        // Hide duplicate warning
        const dupWarning = document.getElementById('duplicate-warning');
        if (dupWarning) {
            dupWarning.classList.add('hidden');
        }

        modal.classList.remove('hidden');
    }

    hide() {
        const modal = document.getElementById('add-contact-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async checkDuplicate(email) {
        if (!email || this.isEditMode) return;

        try {
            const response = await API.checkDuplicate({ email });
            const dupWarning = document.getElementById('duplicate-warning');
            
            if (response.email_check && response.email_check.exists) {
                if (dupWarning) {
                    dupWarning.classList.remove('hidden');
                    this.renderDuplicateWarning(response.email_check.contact);
                }
            } else {
                if (dupWarning) {
                    dupWarning.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);
        }
    }

    renderDuplicateWarning(contact) {
        const content = document.getElementById('duplicate-warning-content');
        if (!content) return;

        content.innerHTML = `
            <div class="duplicate-contact-card">
                <div style="font-weight: 600; margin-bottom: 8px;">${contact.name}</div>
                <div class="duplicate-contact-info">
                    <div class="duplicate-info-item">
                        <div class="duplicate-info-label">Status</div>
                        <div class="duplicate-info-value">
                            <span class="status-badge ${contact.status.toLowerCase().replace(' ', '-')}">${contact.status}</span>
                        </div>
                    </div>
                    <div class="duplicate-info-item">
                        <div class="duplicate-info-label">Last Contacted</div>
                        <div class="duplicate-info-value">${formatDate(contact.last_contacted)}</div>
                    </div>
                    <div class="duplicate-info-item">
                        <div class="duplicate-info-label">Total Touches</div>
                        <div class="duplicate-info-value">${contact.total_touches}</div>
                    </div>
                    <div class="duplicate-info-item">
                        <div class="duplicate-info-label">Has Replied</div>
                        <div class="duplicate-info-value">${contact.has_replied ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            company: document.getElementById('contact-company').value,
            job_title: document.getElementById('contact-job-title').value,
            job_category: document.getElementById('contact-job-category').value,
            status: document.getElementById('contact-status').value
        };

        try {
            let response;
            if (this.isEditMode) {
                response = await API.updateContact(this.editingContactId, formData);
            } else {
                response = await API.createContact(formData);
            }

            if (response.success) {
                showNotification(
                    this.isEditMode ? 'Contact updated successfully' : 'Contact added successfully',
                    'success'
                );
                this.hide();
                if (window.contactsPage) {
                    window.contactsPage.loadContacts();
                }
            } else {
                showNotification(response.error || 'Error saving contact', 'danger');
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            showNotification('Error saving contact', 'danger');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.addContactForm = new AddContactForm();
});
