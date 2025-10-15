// Lead Discovery Page Controller
class LeadDiscoveryPage {
    constructor() {
        this.jobs = [];
        this.progressInterval = null;
        this.pollingStartTime = null;
        this.MAX_POLLING_TIME = 5 * 60 * 1000; // 5 minutes
        
        // Keyword expansion mapping
        this.industryKeywords = {
            'construction': ['home builder', 'general contractor', 'custom home builder', 'residential construction', 'design build'],
            'roofing': ['roofing contractor', 'roof repair', 'roof replacement', 'roofer'],
            'hvac': ['hvac', 'heating cooling', 'air conditioning', 'furnace repair', 'ac repair'],
            'plumbing': ['plumber', 'plumbing contractor', 'drain cleaning', 'water heater'],
            'electrical': ['electrician', 'electrical contractor', 'electrical services'],
            'landscaping': ['landscaping', 'lawn care', 'landscape design', 'hardscaping', 'lawn service'],
            'healthcare': ['doctor', 'physician', 'medical clinic', 'family practice', 'medical center'],
            'dental': ['dentist', 'dental clinic', 'orthodontist', 'cosmetic dentistry'],
            'veterinary': ['veterinarian', 'animal hospital', 'pet clinic', 'veterinary clinic'],
            'legal': ['lawyer', 'attorney', 'law firm', 'legal services'],
            'accounting': ['accountant', 'CPA', 'bookkeeping', 'tax services'],
            'realestate': ['real estate agent', 'realtor', 'property management', 'real estate agency'],
            'restaurants': ['restaurant', 'cafe', 'bistro', 'eatery', 'diner'],
            'wellness': ['spa', 'massage', 'wellness center', 'med spa'],
            'beauty': ['hair salon', 'beauty salon', 'barber', 'nail salon'],
            'fitness': ['gym', 'fitness center', 'personal training', 'yoga studio'],
            'automotive': ['auto repair', 'car mechanic', 'auto body', 'oil change', 'car repair'],
            'cleaning': ['house cleaning', 'maid service', 'commercial cleaning', 'cleaning service'],
            'photography': ['photographer', 'wedding photography', 'portrait studio'],
            'retail': ['store', 'shop', 'boutique', 'retail']
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const createJobBtn = document.getElementById('create-discovery-job-btn');
        if (createJobBtn) {
            createJobBtn.addEventListener('click', () => this.showCreateJobModal());
        }
    }

    async loadJobs() {
        try {
            const response = await API.getDiscoveryJobs();
            if (response.success) {
                this.jobs = response.jobs;
                this.renderJobs();
                
                const runningJob = this.jobs.find(j => j.status === 'running');
                if (runningJob && !this.progressInterval) {
                    this.startProgressPolling(runningJob.id);
                } else if (!runningJob && this.progressInterval) {
                    this.stopProgressPolling();
                }
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            showNotification('Error loading discovery jobs', 'danger');
        }
    }

    startProgressPolling(jobId) {
        this.pollingStartTime = Date.now();
        
        this.progressInterval = setInterval(async () => {
            try {
                // Check if we've been polling too long (timeout after 5 minutes)
                const elapsedTime = Date.now() - this.pollingStartTime;
                if (elapsedTime > this.MAX_POLLING_TIME) {
                    console.warn(`Job ${jobId} polling timeout after 5 minutes`);
                    this.stopProgressPolling();
                    showNotification('Job took too long. Please refresh or delete if stuck.', 'warning');
                    return;
                }
                
                const response = await fetch(`http://localhost:5001/api/lead-discovery/jobs/${jobId}/progress`);
                const data = await response.json();
                
                if (data.success && data.progress && data.progress.message) {
                    this.updateJobProgress(jobId, data.progress);
                }
                
                await this.loadJobs();
                
                // Stop polling if job is no longer running
                const job = this.jobs.find(j => j.id === jobId);
                if (job && (job.status === 'completed' || job.status === 'failed')) {
                    console.log(`Job ${jobId} finished with status: ${job.status}`);
                    this.stopProgressPolling();
                }
            } catch (error) {
                console.error('Error polling progress:', error);
            }
        }, 2000);
    }

    stopProgressPolling() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            this.pollingStartTime = null;
            console.log('✓ Stopped progress polling');
        }
    }

    updateJobProgress(jobId, progress) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            job.progress = progress;
            this.renderJobs();
        }
    }

    renderJobs() {
        const container = document.getElementById('discovery-jobs-list');
        if (!container) return;

        if (this.jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-search" style="font-size: 48px; color: var(--text-secondary);"></i></div>
                    <h3>No discovery jobs yet</h3>
                    <p>Create your first job to find and analyze leads automatically</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.jobs.map(job => `
            <div class="card mb-2">
                <div class="card-body" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h3 style="font-size: 18px; margin-bottom: 8px;">${job.job_name}</h3>
                            <div style="display: flex; gap: 16px; font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">
                                <span><i class="fas fa-${job.source === 'google' ? 'google' : 'map-marker-alt'}"></i> ${job.source}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                                <span><i class="fas fa-ruler"></i> ${job.radius_miles} miles</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span class="status-badge ${job.status}">
                                    ${job.status === 'completed' ? '<i class="fas fa-check-circle"></i>' : 
                                      job.status === 'running' ? '<i class="fas fa-spinner fa-spin"></i>' :
                                      job.status === 'failed' ? '<i class="fas fa-times-circle"></i>' :
                                      '<i class="fas fa-clock"></i>'}
                                    ${job.status}
                                </span>
                                ${job.status === 'completed' ? `
                                    <span style="font-size: 14px; color: var(--success-color);">
                                        Found: ${job.total_found} | Imported: ${job.total_imported} | Duplicates: ${job.total_duplicates}
                                    </span>
                                ` : ''}
                                ${job.status === 'failed' ? `
                                    <span style="font-size: 13px; color: var(--danger-color);">
                                        ${job.error_message || 'Unknown error'}
                                    </span>
                                ` : ''}
                                ${job.status === 'running' && job.progress ? `
                                    <div style="flex: 1;">
                                        <div style="font-size: 13px; color: var(--primary-color); margin-bottom: 6px;">
                                            ${job.progress.message}
                                        </div>
                                        ${job.progress.step && job.progress.total ? `
                                            <div style="background: var(--bg-color); height: 6px; border-radius: 3px; overflow: hidden;">
                                                <div style="background: var(--primary-color); height: 100%; width: ${(job.progress.step / job.progress.total) * 100}%; transition: width 0.3s;"></div>
                                            </div>
                                            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                                                ${job.progress.step} / ${job.progress.total}
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${job.status === 'pending' ? `
                                <button class="btn btn-primary btn-sm" onclick="window.leadDiscoveryPage.runJob(${job.id})">
                                    <i class="fas fa-play"></i> Run
                                </button>
                            ` : ''}
                            <button class="btn btn-danger btn-sm" onclick="window.leadDiscoveryPage.deleteJob(${job.id}, ${job.status === 'running'})" title="Delete this job">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showCreateJobModal() {
        const modal = document.getElementById('create-job-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    async createJob() {
        const jobName = document.getElementById('job-name').value;
        const source = document.getElementById('job-source').value;
        const location = document.getElementById('job-location').value;
        const radius = document.getElementById('job-radius').value;
        const customKeywords = document.getElementById('custom-keywords').value;
        const selectedIndustries = Array.from(document.querySelectorAll('input[name="job-industries"]:checked')).map(cb => cb.value);

        if (!jobName || !source || !location) {
            showNotification('Please fill in all required fields', 'warning');
            return;
        }

        let allKeywords = [];
        
        selectedIndustries.forEach(industry => {
            if (this.industryKeywords[industry]) {
                allKeywords = [...allKeywords, ...this.industryKeywords[industry]];
            }
        });
        
        if (customKeywords && customKeywords.trim()) {
            const customList = customKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
            allKeywords = [...allKeywords, ...customList];
        }

        allKeywords = [...new Set(allKeywords)];

        if (allKeywords.length === 0) {
            showNotification('Please enter custom keywords or select at least one industry', 'warning');
            return;
        }

        if (allKeywords.length > 20) {
            showNotification(`You have ${allKeywords.length} total keywords. Limit to 20 for best results. Try selecting fewer industries.`, 'warning');
            return;
        }

        try {
            const response = await API.createDiscoveryJob({
                job_name: jobName,
                source: source,
                location: location,
                radius_miles: parseInt(radius),
                industries: allKeywords
            });

            if (response.success) {
                showNotification(`Discovery job created with ${allKeywords.length} search terms!`, 'success');
                document.getElementById('create-job-modal').classList.add('hidden');
                
                document.getElementById('job-name').value = '';
                document.getElementById('custom-keywords').value = '';
                document.querySelectorAll('input[name="job-industries"]:checked').forEach(cb => cb.checked = false);
                
                this.loadJobs();
            } else {
                showNotification(response.error || 'Error creating job', 'danger');
            }
        } catch (error) {
            console.error('Error creating job:', error);
            showNotification('Error creating job', 'danger');
        }
    }

    async runJob(jobId) {
        try {
            showNotification('Starting discovery... Progress will update automatically.', 'info');
            
            API.runDiscoveryJob(jobId).then(response => {
                if (response.success) {
                    showNotification(`Job completed! Imported ${response.job.total_imported} leads.`, 'success');
                } else {
                    showNotification(`Error: ${response.error}`, 'danger');
                }
                this.loadJobs();
            });
            
            this.loadJobs();
            
        } catch (error) {
            console.error('Error running job:', error);
            showNotification('Error running job', 'danger');
        }
    }

    async deleteJob(jobId, isRunning = false) {
        const confirmMsg = isRunning 
            ? 'This job appears to be stuck. Force delete it?' 
            : 'Delete this discovery job?';
        
        const confirmed = await window.customConfirm(confirmMsg, 'Delete Job');
        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5001/api/lead-discovery/jobs/${jobId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                showNotification('Job deleted', 'success');
                this.loadJobs();
            } else {
                showNotification('Error deleting job', 'danger');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            showNotification('Error deleting job', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.leadDiscoveryPage = new LeadDiscoveryPage();
});
