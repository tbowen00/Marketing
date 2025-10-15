// Custom Confirmation Modal
class ConfirmModal {
    constructor() {
        this.modal = document.getElementById('confirm-modal');
        this.titleEl = document.getElementById('confirm-modal-title');
        this.messageEl = document.getElementById('confirm-modal-message');
        this.confirmBtn = document.getElementById('confirm-modal-confirm-btn');
        this.resolveCallback = null;
    }

    show(title, message, confirmText = 'Confirm', confirmClass = 'btn-danger') {
        return new Promise((resolve) => {
            this.resolveCallback = resolve;
            this.titleEl.textContent = title;
            this.messageEl.textContent = message;
            this.confirmBtn.textContent = confirmText;
            
            // Reset button classes
            this.confirmBtn.className = 'btn';
            this.confirmBtn.classList.add(confirmClass);
            
            this.modal.classList.remove('hidden');
        });
    }

    confirm() {
        this.modal.classList.add('hidden');
        if (this.resolveCallback) {
            this.resolveCallback(true);
            this.resolveCallback = null;
        }
    }

    cancel() {
        this.modal.classList.add('hidden');
        if (this.resolveCallback) {
            this.resolveCallback(false);
            this.resolveCallback = null;
        }
    }
}

// Initialize global confirm modal
window.confirmModal = new ConfirmModal();

// Override native confirm
window.customConfirm = async (message, title = 'Confirm Action') => {
    return await window.confirmModal.show(title, message);
};
