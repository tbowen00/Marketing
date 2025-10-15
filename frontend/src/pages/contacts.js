// Contacts Page Controller
class ContactsPage {
    constructor() {
        this.contacts = [];
        this.selectedContactId = null;
        this.currentFilters = {};
        this.selectMode = false;
        this.selectedContacts = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadContacts();
        this.setupDropdownHandlers();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.loadContacts();
            }, 500));
        }

        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyQuickFilter(e.currentTarget.dataset.filter);
            });
        });

        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
            });
        });

        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    setupDropdownHandlers() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.actions-dropdown')) {
                document.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }

    toggleSelectMode() {
        this.selectMode = !this.selectMode;
        this.selectedContacts.clear();
        
        const checkboxHeader = document.getElementById('checkbox-header');
        const selectModeBtn = document.getElementById('select-mode-btn');
        const bulkActions = document.getElementById('bulk-actions');
        
        if (this.selectMode) {
            checkboxHeader.style.display = 'table-cell';
            selectModeBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
            selectModeBtn.classList.remove('btn-secondary');
            selectModeBtn.classList.add('btn-danger');
            bulkActions.style.display = 'flex';
        } else {
            checkboxHeader.style.display = 'none';
            selectModeBtn.innerHTML = '<i class="fas fa-check-square"></i> Select';
            selectModeBtn.classList.remove('btn-danger');
            selectModeBtn.classList.add('btn-secondary');
            bulkActions.style.display = 'none';
        }
        
        this.renderContacts();
        this.updateSelectedCount();
    }

    toggleSelectAll(checked) {
        if (checked) {
            this.contacts.forEach(c => this.selectedContacts.add(c.id));
        } else {
            this.selectedContacts.clear();
        }
        this.renderContacts();
        this.updateSelectedCount();
    }

    toggleContactSelection(contactId) {
        if (this.selectedContacts.has(contactId)) {
            this.selectedContacts.delete(contactId);
        } else {
            this.selectedContacts.add(contactId);
        }
        this.updateSelectedCount();
        this.renderContacts();
    }

    updateSelectedCount() {
        const countEl = document.getElementById('selected-count');
        if (countEl) {
            countEl.textContent = `${this.selectedContacts.size} selected`;
        }
        
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.selectedContacts.size === this.contacts.length && this.contacts.length > 0;
        }
        
        // Show/hide bulk email button
        const bulkEmailBtn = document.getElementById('bulk-email-btn');
        if (bulkEmailBtn) {
            if (this.selectedContacts.size > 0) {
                bulkEmailBtn.style.display = 'block';
            } else {
                bulkEmailBtn.style.display = 'none';
            }
        }
    }

    async bulkEmail() {
        if (this.selectedContacts.size === 0) {
            showNotification('Please select contacts to email', 'warning');
            return;
        }

        // Get selected contacts with emails
        const selectedWithEmails = this.contacts.filter(c => 
            this.selectedContacts.has(c.id) && c.email && c.email.trim() !== ''
        );

        if (selectedWithEmails.length === 0) {
            showNotification('None of the selected contacts have email addresses', 'warning');
            return;
        }

        const contactIds = selectedWithEmails.map(c => c.id);
        window.emailComposer.show(contactIds);
    }

    async bulkDelete() {
        if (this.selectedContacts.size === 0) {
            showNotification('Please select contacts to delete', 'warning');
            return;
        }

        const confirmed = await window.customConfirm(
            `Delete ${this.selectedContacts.size} selected contacts? This cannot be undone.`,
            'Delete Selected Contacts'
        );

        if (!confirmed) return;

        try {
            const contactIds = Array.from(this.selectedContacts);
            const response = await fetch('http://localhost:5001/api/contacts/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact_ids: contactIds })
            });
            const data = await response.json();

            if (data.success) {
                showNotification(`Successfully deleted ${data.deleted} contacts`, 'success');
                this.selectedContacts.clear();
                this.toggleSelectMode();
                this.loadContacts();
            } else {
                showNotification('Error deleting contacts', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error deleting contacts', 'danger');
        }
    }

    async deleteAll() {
        const confirmed1 = await window.customConfirm(
            '⚠️ WARNING: This will permanently delete ALL leads in your database. This action cannot be undone. Are you absolutely sure?',
            'Delete All Leads'
        );

        if (!confirmed1) return;

        const confirmed2 = await window.customConfirm(
            'This is your final confirmation. All lead data will be lost forever. Continue with deletion?',
            'Final Confirmation'
        );

        if (!confirmed2) return;

        try {
            const response = await fetch('http://localhost:5001/api/contacts/delete-all', {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                showNotification(`Deleted ${data.deleted} contacts`, 'success');
                this.loadContacts();
            } else {
                showNotification('Error deleting all contacts', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error deleting all contacts', 'danger');
        }
    }

    toggleDropdown(contactId, event) {
        event.stopPropagation();
        
        document.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
            if (menu.id !== `dropdown-${contactId}`) {
                menu.classList.remove('show');
            }
        });
        
        const dropdown = document.getElementById(`dropdown-${contactId}`);
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    async loadContacts() {
        try {
            const response = await API.getContacts(this.currentFilters);
            if (response.success) {
                // Client-side filtering for email/phone
                let filteredContacts = response.contacts;
                
                if (this.currentFilters.has_email === 'true') {
                    filteredContacts = filteredContacts.filter(c => c.email && c.email.trim() !== '');
                } else if (this.currentFilters.has_email === 'false') {
                    filteredContacts = filteredContacts.filter(c => !c.email || c.email.trim() === '');
                }
                
                if (this.currentFilters.has_phone === 'true') {
                    filteredContacts = filteredContacts.filter(c => c.phone && c.phone.trim() !== '');
                }
                
                this.contacts = filteredContacts;
                this.renderContacts();
                this.updateContactCount(filteredContacts.length);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            showNotification('Error loading contacts', 'danger');
        }
    }

    renderContacts() {
        const tbody = document.getElementById('contacts-table-body');
        if (!tbody) return;

        if (this.contacts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${this.selectMode ? 11 : 10}" class="text-center" style="padding: 40px;">
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-inbox" style="font-size: 48px; color: var(--text-secondary);"></i></div>
                            <h3>No contacts found</h3>
                            <p>Try adjusting your filters or discover new leads</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.contacts.map(contact => {
            const hasEmail = contact.email && contact.email.trim() !== '';
            const hasPhone = contact.phone && contact.phone.trim() !== '';
            const isSelected = this.selectedContacts.has(contact.id);
            
            return `
            <tr onclick="${this.selectMode ? `window.contactsPage.toggleContactSelection(${contact.id})` : `window.contactsPage.showContactDetail(${contact.id})`}" 
                style="cursor: pointer; ${isSelected ? 'background-color: var(--bg-color);' : ''}">
                ${this.selectMode ? `
                    <td class="checkbox-cell" onclick="event.stopPropagation(); window.contactsPage.toggleContactSelection(${contact.id})">
                        <input 
                            type="checkbox" 
                            ${isSelected ? 'checked' : ''}
                            onclick="event.stopPropagation(); window.contactsPage.toggleContactSelection(${contact.id})"
                        >
                    </td>
                ` : ''}
                <td>
                    <div>
                        <div style="font-weight: 500; margin-bottom: 4px;">${contact.name}</div>
                        <div style="font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-map-marker-alt" style="font-size: 10px;"></i>
                            ${contact.city || ''} ${contact.state || ''}
                        </div>
                    </div>
                </td>
                <td>${contact.company || contact.name || '-'}</td>
                <td>
                    <span style="font-size: 13px; color: var(--text-secondary);">${contact.industry || '-'}</span>
                </td>
                <td>
                    <span class="tier-badge tier-${contact.tier?.toLowerCase() || 'low'}">${contact.tier || 'Not Scored'}</span>
                </td>
                <td>
                    <span class="source-badge source-${contact.source || 'manual'}">
                        <i class="fas fa-${contact.source === 'google' ? 'google' : 'user'}"></i>
                        ${contact.source || 'manual'}
                    </span>
                </td>
                <td>
                    ${hasEmail ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-envelope" style="color: var(--success-color); font-size: 12px;"></i>
                            <span style="font-size: 13px;">${contact.email}</span>
                        </div>
                    ` : hasPhone ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-phone" style="color: var(--primary-color); font-size: 12px;"></i>
                            <span style="font-size: 13px;">${contact.phone}</span>
                        </div>
                    ` : '<span style="color: var(--text-secondary); font-size: 13px;">No contact</span>'}
                </td>
                <td>
                    ${contact.ai_opportunity_score > 60 ? '<span style="color: var(--success-color); font-weight: 600;">High</span>' : 
                      contact.ai_opportunity_score > 30 ? '<span style="color: var(--warning-color);">Medium</span>' : 
                      contact.ai_opportunity_score > 0 ? '<span style="color: var(--text-secondary);">Low</span>' : 
                      '<span style="color: var(--text-secondary);">-</span>'}
                </td>
                <td><span class="status-badge ${contact.status.toLowerCase().replace(' ', '-')}">${contact.status}</span></td>
                <td>${contact.total_touches}</td>
                <td onclick="event.stopPropagation()">
                    <div class="actions-dropdown">
                        <button class="actions-dropdown-toggle" onclick="window.contactsPage.toggleDropdown(${contact.id}, event)">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div id="dropdown-${contact.id}" class="actions-dropdown-menu">
                            ${hasEmail ? `
                                <button class="actions-dropdown-item" onclick="window.contactsPage.showEmailComposer([${contact.id}])">
                                    <i class="fas fa-envelope"></i>
                                    Send Email
                                </button>
                            ` : ''}
                            ${hasPhone ? `
                                <button class="actions-dropdown-item" onclick="window.contactsPage.callContact('${contact.phone}')">
                                    <i class="fas fa-phone"></i>
                                    Call
                                </button>
                            ` : ''}
                            ${(hasEmail || hasPhone) ? '<div class="actions-dropdown-divider"></div>' : ''}
                            <button class="actions-dropdown-item" onclick="window.contactsPage.editContact(${contact.id})">
                                <i class="fas fa-edit"></i>
                                Edit
                            </button>
                            <div class="actions-dropdown-divider"></div>
                            <button class="actions-dropdown-item danger" onclick="window.contactsPage.deleteContact(${contact.id})">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    updateContactCount(count) {
        const countEl = document.getElementById('contact-count');
        if (countEl) {
            countEl.textContent = count;
        }
    }

    applyQuickFilter(filterType) {
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        this.currentFilters = {};

        switch (filterType) {
            case 'fresh':
                this.currentFilters.status = 'Lead';
                break;
            case 'high-tier':
                this.currentFilters.tier = 'High';
                break;
            case 'needs-email':
                this.currentFilters.has_email = 'false';
                break;
            case 'has-email':
                this.currentFilters.has_email = 'true';
                break;
            case 'has-phone':
                this.currentFilters.has_phone = 'true';
                break;
            case 'all':
                break;
        }

        const clickedBtn = document.querySelector(`.quick-filter-btn[data-filter="${filterType}"]`);
        if (clickedBtn) {
            clickedBtn.classList.add('active');
        }
        
        document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
        
        this.loadContacts();
    }

    updateFilters() {
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const filters = { ...this.currentFilters };
        const search = filters.search;
        delete filters.search;
        
        this.currentFilters = search ? { search } : {};

        const industryCheckboxes = document.querySelectorAll('input[name="industry"]:checked');
        if (industryCheckboxes.length > 0) {
            this.currentFilters.industry = Array.from(industryCheckboxes).map(cb => cb.value)[0];
        }

        const statusCheckboxes = document.querySelectorAll('input[name="status"]:checked');
        if (statusCheckboxes.length > 0) {
            this.currentFilters.status = Array.from(statusCheckboxes).map(cb => cb.value)[0];
        }

        const hasEmailCheckbox = document.querySelector('input[name="contact-filter"][value="has-email"]');
        const hasPhoneCheckbox = document.querySelector('input[name="contact-filter"][value="has-phone"]');
        const missingEmailCheckbox = document.querySelector('input[name="contact-filter"][value="missing-email"]');

        if (hasEmailCheckbox && hasEmailCheckbox.checked) {
            this.currentFilters.has_email = 'true';
        }
        if (hasPhoneCheckbox && hasPhoneCheckbox.checked) {
            this.currentFilters.has_phone = 'true';
        }
        if (missingEmailCheckbox && missingEmailCheckbox.checked) {
            this.currentFilters.has_email = 'false';
        }

        this.loadContacts();
    }

    clearFilters() {
        this.currentFilters = {};
        document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.quick-filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.quick-filter-btn[data-filter="all"]')?.classList.add('active');
        this.loadContacts();
    }

    showAddContactModal() {
        window.addContactForm.show();
    }

    async showContactDetail(contactId) {
        if (this.selectMode) return;
        
        try {
            const response = await API.getContact(contactId);
            if (response.success) {
                window.contactCard.show(response.contact, response.outreach_history, response.notes);
            }
        } catch (error) {
            console.error('Error loading contact details:', error);
            showNotification('Error loading contact details', 'danger');
        }
    }

    editContact(contactId) {
        const contact = this.contacts.find(c => c.id === contactId);
        if (contact) {
            window.addContactForm.show(contact);
        }
    }

    async deleteContact(contactId) {
        const confirmed = await window.customConfirm(
            'Are you sure you want to delete this contact? This action cannot be undone.',
            'Delete Contact'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5001/api/contacts/${contactId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                showNotification('Contact deleted successfully', 'success');
                this.loadContacts();
            } else {
                showNotification('Error deleting contact', 'danger');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            showNotification('Error deleting contact', 'danger');
        }
    }

    callContact(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        
        navigator.clipboard.writeText(phone).then(() => {
            showNotification(`Phone number ${phone} copied to clipboard!`, 'success');
        }).catch(() => {
            showNotification(`Phone number: ${phone}`, 'info');
        });
        
        window.location.href = `tel:${cleanPhone}`;
    }

    showEmailComposer(contactIds) {
        window.emailComposer.show(contactIds);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.contactsPage = new ContactsPage();
});
