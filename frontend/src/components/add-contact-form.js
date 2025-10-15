// Add Contact Form Component
class AddContactForm {
    constructor() {
        this.duplicateContact = null;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalContainer = document.getElementById('add-contact-modal');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Add New Lead</h2>
                    <button class="modal-close" onclick="window.addContactForm.close()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="contact-form">
                        <div class="form-group">
                            <label for="contact-name">Name *</label>
                            <input type="text" id="contact-name" required>
                        </div>

                        <div class="form-group">
                            <label for="contact-company">Company *</label>
                            <input type="text" id="contact-company" required>
                        </div>

                        <div class="two-column">
                            <div class="form-group">
                                <label for="contact-email">Email</label>
                                <input type="email" id="contact-email">
                            </div>
                            <div class="form-group">
                                <label for="contact-phone">Phone</label>
                                <input type="tel" id="contact-phone">
                            </div>
                        </div>

                        <div class="two-column">
                            <div class="form-group">
                                <label for="contact-industry">Industry</label>
                                <select id="contact-industry">
                                    <option value="">Select Industry</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="home_services">Home Services</option>
                                    <option value="food">Food & Beverage</option>
                                    <option value="legal">Legal</option>
                                    <option value="wellness">Wellness</option>
                                    <option value="retail">Retail</option>
                                    <option value="technology">Technology</option>
                                    <option value="construction">Construction</option>
                                    <option value="automotive">Automotive</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="contact-tier">Tier</label>
                                <select id="contact-tier">
                                    <option value="High">High</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div class="two-column">
                            <div class="form-group">
                                <label for="contact-city">City</label>
                                <input type="text" id="contact-city">
                            </div>
                            <div class="form-group">
                                <label for="contact-state">State</label>
                                <input type="text" id="contact-state" placeholder="OK">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="contact-website">Website</label>
                            <input type="url" id="contact-website" placeholder="https://">
                        </div>

                        <div class="form-group">
                            <label for="contact-notes">Notes</label>
                            <textarea id="contact-notes" rows="3"></textarea>
                        </div>

                        <div id="duplicate-warning" style="display: none;" class="alert alert-warning">
                            <span class="alert-icon"><i class="fas fa-exclamation-triangle"></i></span>
                            <span id="duplicate-message"></span>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.addContactForm.close()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.addContactForm.submit()">
                        <i class="fas fa-plus"></i> Add Lead
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const emailInput = document.getElementById('contact-email');
            if (emailInput) {
                emailInput.addEventListener('blur', () => this.checkDuplicate());
            }
        }, 100);
    }

    show() {
        const modal = document.getElementById('add-contact-modal');
        if (modal) {
            this.clearForm();
            modal.classList.remove('hidden');
        }
    }

    close() {
        const modal = document.getElementById('add-contact-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.clearForm();
        }
    }

    clearForm() {
        const form = document.getElementById('contact-form');
        if (form) form.reset();
        
        const warning = document.getElementById('duplicate-warning');
        if (warning) warning.style.display = 'none';
        
        this.duplicateContact = null;
    }

    async checkDuplicate() {
        const email = document.getElementById('contact-email')?.value?.trim();
        if (!email) return;

        try {
            const response = await API.checkDuplicate({ email });
            
            if (response.is_duplicate && response.contact) {
                this.duplicateContact = response.contact;
                const warning = document.getElementById('duplicate-warning');
                const message = document.getElementById('duplicate-message');
                
                if (warning && message) {
                    message.textContent = `This email already exists for ${response.contact.name} at ${response.contact.company}`;
                    warning.style.display = 'flex';
                }
            } else {
                const warning = document.getElementById('duplicate-warning');
                if (warning) warning.style.display = 'none';
                this.duplicateContact = null;
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);
        }
    }

    async submit() {
        if (this.duplicateContact) {
            const confirmed = await window.customConfirm(
                'This email already exists. Add anyway?',
                'Duplicate Contact'
            );
            if (!confirmed) return;
        }

        const data = {
            name: document.getElementById('contact-name')?.value?.trim(),
            company: document.getElementById('contact-company')?.value?.trim(),
            email: document.getElementById('contact-email')?.value?.trim(),
            phone: document.getElementById('contact-phone')?.value?.trim(),
            industry: document.getElementById('contact-industry')?.value,
            tier: document.getElementById('contact-tier')?.value,
            city: document.getElementById('contact-city')?.value?.trim(),
            state: document.getElementById('contact-state')?.value?.trim(),
            website_url: document.getElementById('contact-website')?.value?.trim(),
            source: 'manual'
        };

        if (!data.name || !data.company) {
            showNotification('Please fill in required fields', 'warning');
            return;
        }

        try {
            const response = await API.createContact(data);
            
            if (response.success) {
                showNotification('Lead added successfully!', 'success');
                this.close();
                
                // Reload contacts if on contacts page
                if (window.contactsPage) {
                    window.contactsPage.loadContacts();
                }
            } else {
                showNotification(response.error || 'Error adding lead', 'danger');
            }
        } catch (error) {
            console.error('Error creating contact:', error);
            showNotification('Error adding lead', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addContactForm = new AddContactForm();
});
