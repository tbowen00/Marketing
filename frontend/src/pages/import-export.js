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
            <div style="padding: 24px; max-width: 1000px;">
                <!-- Export Section -->
                <div class="card mb-3">
                    <div class="card-body" style="padding: 24px;">
                        <div style="display: flex; align-items: start; gap: 20px;">
                            <div style="flex: 1;">
                                <h3 style="margin-bottom: 8px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-download" style="color: var(--primary-color);"></i>
                                    Export Contacts
                                </h3>
                                <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
                                    Download all your contacts as a CSV file. Perfect for backups or importing into other tools.
                                </p>
                                <button class="btn btn-primary" onclick="window.importExportPage.exportContacts()">
                                    <i class="fas fa-file-csv"></i> Export to CSV
                                </button>
                            </div>
                            <div style="background: var(--bg-color); padding: 16px; border-radius: var(--radius-md); min-width: 200px;">
                                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Total Contacts</div>
                                <div id="export-count" style="font-size: 32px; font-weight: 700; color: var(--primary-color);">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Import Section -->
                <div class="card">
                    <div class="card-body" style="padding: 24px;">
                        <h3 style="margin-bottom: 8px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-upload" style="color: var(--success-color);"></i>
                            Import Contacts
                        </h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
                            Import contacts from a CSV file with columns: Name, Company, Email, Phone, Industry
                        </p>
                        
                        <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 32px; text-align: center; margin-bottom: 16px;">
                            <input type="file" id="import-file" accept=".csv" style="display: none;" onchange="window.importExportPage.handleFileSelect(event)">
                            <label for="import-file" style="cursor: pointer;">
                                <div style="font-size: 48px; color: var(--text-secondary); margin-bottom: 12px;">📁</div>
                                <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Click to select CSV file</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">or drag and drop here</div>
                            </label>
                        </div>

                        <div id="import-preview" style="display: none; margin-top: 16px;">
                            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Preview</h4>
                            <div id="import-preview-content" style="max-height: 200px; overflow-y: auto; background: var(--bg-color); padding: 12px; border-radius: var(--radius-md); font-size: 13px;"></div>
                            <div style="margin-top: 16px; display: flex; gap: 12px;">
                                <button class="btn btn-success" onclick="window.importExportPage.confirmImport()">
                                    <i class="fas fa-check"></i> Import <span id="import-count">0</span> Contacts
                                </button>
                                <button class="btn btn-secondary" onclick="window.importExportPage.cancelImport()">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sample CSV Template -->
                <div class="card mt-3">
                    <div class="card-body" style="padding: 24px;">
                        <h3 style="margin-bottom: 8px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-file-download" style="color: var(--text-secondary);"></i>
                            Download Sample Template
                        </h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
                            Not sure about the format? Download our sample CSV template to see the required structure.
                        </p>
                        <button class="btn btn-secondary" onclick="window.importExportPage.downloadTemplate()">
                            <i class="fas fa-download"></i> Download Template
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.loadContactCount();
    }

    async loadContactCount() {
        try {
            const response = await fetch('http://localhost:5001/api/contacts');
            const data = await response.json();
            const countEl = document.getElementById('export-count');
            if (countEl && data.success) {
                countEl.textContent = data.contacts.length;
            }
        } catch (error) {
            console.error('Error loading count:', error);
        }
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

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            this.previewCSV(csv);
        };
        reader.readAsText(file);
    }

    previewCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const preview = lines.slice(0, 6).join('\n');
        
        document.getElementById('import-preview').style.display = 'block';
        document.getElementById('import-preview-content').textContent = preview;
        document.getElementById('import-count').textContent = Math.max(0, lines.length - 1);
        
        this.pendingImport = csv;
    }

    async confirmImport() {
        showNotification('CSV import feature coming in next update!', 'info');
        this.cancelImport();
    }

    cancelImport() {
        document.getElementById('import-preview').style.display = 'none';
        document.getElementById('import-file').value = '';
        this.pendingImport = null;
    }

    downloadTemplate() {
        const template = `Name,Company,Email,Phone,Industry,Status,Tier,Source
"John Doe","Acme Corp","john@acme.com","(555) 123-4567","Technology","Lead","High","manual"
"Jane Smith","Tech Solutions","jane@techsol.com","(555) 234-5678","Software","Contacted","Medium","google"`;
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'everly-import-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Template downloaded', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.importExportPage = new ImportExportPage();
});
