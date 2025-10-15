// Import/Export Tools Controller
class ImportExportTools {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const exportBtn = document.getElementById('export-contacts-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportContacts());
        }

        const downloadTemplateBtn = document.getElementById('download-template-btn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => this.downloadTemplate());
        }

        const importFileInput = document.getElementById('import-file-input');
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        const importBtn = document.getElementById('import-contacts-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                importFileInput.click();
            });
        }
    }

    async exportContacts() {
        try {
            const response = await API.getContacts();
            if (response.success) {
                const csv = this.convertToCSV(response.contacts);
                this.downloadCSV(csv, `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
                showNotification('Contacts exported successfully', 'success');
            }
        } catch (error) {
            console.error('Error exporting contacts:', error);
            showNotification('Error exporting contacts', 'danger');
        }
    }

    convertToCSV(contacts) {
        if (contacts.length === 0) return '';

        const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Job Category', 'Status'];
        const rows = contacts.map(contact => [
            contact.name,
            contact.email,
            contact.phone || '',
            contact.company || '',
            contact.job_title || '',
            contact.job_category || '',
            contact.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadTemplate() {
        const template = 'Name,Email,Phone,Company,Job Title,Job Category,Status\n"John Doe","john@example.com","555-0100","Acme Corp","CEO","Tech","Lead"';
        this.downloadCSV(template, 'contact_import_template.csv');
        showNotification('Template downloaded', 'success');
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csv = e.target.result;
            await this.importContacts(csv);
        };
        reader.readAsText(file);
    }

    async importContacts(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        let successCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const contact = {};

            headers.forEach((header, index) => {
                const value = values[index]?.replace(/"/g, '').trim();
                switch (header.toLowerCase()) {
                    case 'name':
                        contact.name = value;
                        break;
                    case 'email':
                        contact.email = value;
                        break;
                    case 'phone':
                        contact.phone = value;
                        break;
                    case 'company':
                        contact.company = value;
                        break;
                    case 'job title':
                        contact.job_title = value;
                        break;
                    case 'job category':
                        contact.job_category = value;
                        break;
                    case 'status':
                        contact.status = value;
                        break;
                }
            });

            try {
                const response = await API.createContact(contact);
                if (response.success) {
                    successCount++;
                } else if (response.error && response.error.includes('already exists')) {
                    duplicateCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }

        showNotification(
            `Import complete: ${successCount} added, ${duplicateCount} duplicates skipped, ${errorCount} errors`,
            successCount > 0 ? 'success' : 'warning'
        );

        if (window.contactsPage) {
            window.contactsPage.loadContacts();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.importExportTools = new ImportExportTools();
});
