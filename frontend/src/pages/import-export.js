// Import/Export Page Controller
class ImportExportPage {
    constructor() {
        this.init();
    }

    init() {
        // Load when page becomes active
    }

    async loadContent() {
        const container = document.getElementById('import-export-content');
        if (!container) return;

        container.innerHTML = `
            <div style="padding: 24px;">
                <div class="card mb-3">
                    <div class="card-body">
                        <h3 style="margin-bottom: 16px;"><i class="fas fa-download"></i> Export Contacts</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Download all your contacts as a CSV file</p>
                        <button class="btn btn-primary" onclick="window.importExportPage.exportContacts()">
                            <i class="fas fa-file-csv"></i> Export to CSV
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h3 style="margin-bottom: 16px;"><i class="fas fa-upload"></i> Import Contacts</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Import contacts from a CSV file</p>
                        <div class="alert alert-info">
                            <span class="alert-icon"><i class="fas fa-info-circle"></i></span>
                            <span style="font-size: 13px;">CSV import feature coming soon!</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async exportContacts() {
        try {
            showNotification('Preparing CSV export...', 'info');
            
            const response = await fetch('http://localhost:5001/api/contacts');
            const data = await response.json();
            
            if (!data.success || data.contacts.length === 0) {
                showNotification('No contacts to export', 'warning');
                return;
            }

            // Create CSV content
            const headers = ['Name', 'Company', 'Email', 'Phone', 'Industry', 'Status', 'Tier', 'Source', 'City', 'State', 'Website'];
            const rows = data.contacts.map(c => [
                c.name || '',
                c.company || '',
                c.email || '',
                c.phone || '',
                c.industry || '',
                c.status || '',
                c.tier || '',
                c.source || '',
                c.city || '',
                c.state || '',
                c.website_url || ''
            ]);

            const csv = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `everly-contacts-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showNotification(`Exported ${data.contacts.length} contacts`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Error exporting contacts', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.importExportPage = new ImportExportPage();
});
