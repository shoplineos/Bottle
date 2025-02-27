defineModule('theme-card-subscriptions-email', () => {
    class ThemeCardSubscriptionsEmail extends BaseElement {
        #formElement;
        #submitElement;
        constructor() {
            super();
            this.#formElement = this.querySelector('form');
            this.#submitElement = this.querySelector('button[type="submit"]');
            if (this.#formElement && this.#submitElement) {
                this.#formElement.addEventListener('change', this.updateSubmitButtonStatus.bind(this));
            }
        }
        updateSubmitButtonStatus() {
            if (!this.#formElement) {
                throw new Error('Form element not found');
            }
            const formData = new FormData(this.#formElement);
            if (formData.get('customer[unsubscribe_reason]')) {
                if (this.#submitElement) {
                    this.#submitElement.disabled = false;
                }
            }
        }
    }
    window.customElements.define('theme-card-subscriptions-email', ThemeCardSubscriptionsEmail);
});
