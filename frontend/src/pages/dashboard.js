// Main Dashboard Controller
class Dashboard {
    constructor() {
        this.currentPage = 'contacts';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showPage('contacts');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // Add Contact Button
        const addContactBtn = document.getElementById('add-contact-btn');
        if (addContactBtn) {
            addContactBtn.addEventListener('click', () => {
                window.contactsPage.showAddContactModal();
            });
        }
    }

    showPage(pageName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;

            // Load page data
            if (pageName === 'contacts' && window.contactsPage) {
                window.contactsPage.loadContacts();
            } else if (pageName === 'lead-discovery' && window.leadDiscoveryPage) {
                window.leadDiscoveryPage.loadJobs();
            } else if (pageName === 'campaigns' && window.campaignsPage) {
                window.campaignsPage.loadCampaigns();
            } else if (pageName === 'pipeline' && window.pipelineBoard) {
                window.pipelineBoard.loadPipeline();
            } else if (pageName === 'analytics' && window.analyticsPage) {
                window.analyticsPage.loadAnalytics();
            }
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
