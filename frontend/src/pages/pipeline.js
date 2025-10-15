// Pipeline Board Controller (Kanban View)
class PipelineBoard {
    constructor() {
        this.contacts = [];
        this.statuses = ['Lead', 'Contacted', 'Replied', 'Qualified', 'Not Interested', 'Converted'];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Drag and drop will be implemented here
    }

    async loadPipeline() {
        try {
            const response = await API.getContacts();
            if (response.success) {
                this.contacts = response.contacts;
                this.renderPipeline();
            }
        } catch (error) {
            console.error('Error loading pipeline:', error);
            showNotification('Error loading pipeline', 'danger');
        }
    }

    renderPipeline() {
        const container = document.getElementById('pipeline-content');
        if (!container) return;

        const groupedContacts = this.groupContactsByStatus();

        container.innerHTML = `
            <div class="pipeline-board">
                ${this.statuses.map(status => `
                    <div class="pipeline-column">
                        <div class="pipeline-column-header">
                            <h3>${status}</h3>
                            <span class="pipeline-count">${groupedContacts[status]?.length || 0}</span>
                        </div>
                        <div class="pipeline-cards" data-status="${status}">
                            ${this.renderCards(groupedContacts[status] || [])}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.setupDragAndDrop();
    }

    groupContactsByStatus() {
        const grouped = {};
        this.statuses.forEach(status => {
            grouped[status] = this.contacts.filter(c => c.status === status);
        });
        return grouped;
    }

    renderCards(contacts) {
        if (contacts.length === 0) {
            return '<div class="pipeline-empty">No contacts</div>';
        }

        return contacts.map(contact => `
            <div class="pipeline-card" draggable="true" data-contact-id="${contact.id}" onclick="window.contactsPage.showContactDetail(${contact.id})">
                <div class="pipeline-card-header">
                    <div class="activity-avatar" style="width: 32px; height: 32px; font-size: 12px;">
                        ${getInitials(contact.name)}
                    </div>
                    <div class="pipeline-card-name">${contact.name}</div>
                </div>
                <div class="pipeline-card-info">
                    <div>${contact.company || 'No company'}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${contact.email}</div>
                </div>
                <div class="pipeline-card-meta">
                    <span title="Total touches">${contact.total_touches} touches</span>
                    <span>${formatDate(contact.last_contacted)}</span>
                </div>
            </div>
        `).join('');
    }

    setupDragAndDrop() {
        const cards = document.querySelectorAll('.pipeline-card');
        const columns = document.querySelectorAll('.pipeline-cards');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');

                const card = document.querySelector('.dragging');
                if (!card) return;

                const contactId = parseInt(card.dataset.contactId);
                const newStatus = column.dataset.status;

                await this.updateContactStatus(contactId, newStatus);
            });
        });
    }

    async updateContactStatus(contactId, newStatus) {
        try {
            const response = await API.updateContact(contactId, { status: newStatus });
            if (response.success) {
                showNotification('Contact status updated', 'success');
                this.loadPipeline();
            } else {
                showNotification('Error updating status', 'danger');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Error updating status', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pipelineBoard = new PipelineBoard();
});
