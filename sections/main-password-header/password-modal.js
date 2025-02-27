class ThemePasswordModal extends Modal {
    mounted() {
        super.mounted();
        const hasError = !!this.querySelector('input[data-error="true"]');
        if (hasError) {
            this.open();
        }
    }
}
customElements.define('theme-password-modal', ThemePasswordModal);
