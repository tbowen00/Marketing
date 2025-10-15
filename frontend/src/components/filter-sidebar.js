// Filter Sidebar Component
class FilterSidebar {
    constructor() {
        this.filterOptions = null;
        this.init();
    }

    async init() {
        await this.loadFilterOptions();
        this.render();
    }

    async loadFilterOptions() {
        try {
            const response = await API.getFilterOptions();
            if (response.success) {
                this.filterOptions = response;
            }
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    }

    render() {
        const container = document.getElementById('filter-options');
        if (!container || !this.filterOptions) return;

        container.innerHTML = `
            <div class="filter-section">
                <div class="filter-section-title">Job Category</div>
                <div class="checkbox-group">
                    ${this.filterOptions.job_categories.map(category => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="job-category" value="${category}" class="filter-checkbox">
                            ${category}
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="filter-section">
                <div class="filter-section-title">Status</div>
                <div class="checkbox-group">
                    ${this.filterOptions.statuses.map(status => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="status" value="${status}" class="filter-checkbox">
                            ${status}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.filterSidebar = new FilterSidebar();
});
