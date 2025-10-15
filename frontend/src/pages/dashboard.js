// Dashboard Navigation Controller
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                
                // Update active states
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Hide all pages
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                
                // Show selected page
                const pageElement = document.getElementById(`${page}-page`);
                if (pageElement) {
                    pageElement.classList.add('active');
                }

                // Load page content
                this.loadPageContent(page);
            });
        });
    }

    loadPageContent(page) {
        switch(page) {
            case 'contacts':
                window.contactsPage?.loadContacts();
                break;
            case 'campaigns':
                window.campaignsPage?.loadCampaigns();
                break;
            case 'lead-discovery':
                window.leadDiscoveryPage?.loadJobs();
                break;
            case 'analytics':
                window.analyticsPage?.loadAnalytics();
                break;
            case 'pipeline':
                window.pipelineBoard?.loadPipeline();
                break;
            case 'import-export':
                window.importExportPage?.loadContent();
                break;
            case 'templates':
                window.templatesPage?.loadContent();
                break;
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
