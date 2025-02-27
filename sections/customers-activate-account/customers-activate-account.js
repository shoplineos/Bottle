defineModule('theme-main-activate-account', () => {
    class ThemeMainActivateAccount extends Customer {
        #formElement;
        #baseFormElement;
        #submitButtonElement;
        #activateInstance;
        constructor() {
            super();
            this.#baseFormElement = this.querySelector('theme-base-form');
            this.#formElement = this.querySelector('.customer__form');
            this.#submitButtonElement = this.querySelector('button[type="submit"]');
            this.#init();
        }
        async #init() {
            await this.loadCustomerAccountSDK();
            if (!this.#formElement) {
                throw new Error('#formElement is null');
            }
            this.#formElement.addEventListener('submit', this.#onSubmitHandler.bind(this));
            this.#activateInstance = new window.Shopline.customerAccount.Activate(this.#formElement);
        }
        #onSubmitHandler(event) {
            event.preventDefault();
            if (this.#submitButtonElement?.classList.contains('loading')) {
                return;
            }
            this.#submitButtonElement?.classList.add('loading');
            this.#activateInstance
                .submit()
                .then(() => {
                this.#baseFormElement?.clearAllErrorMessage({ resetForm: false });
                window.location.href = window.routes.accountUrl;
            })
                .catch((error) => {
                this.#baseFormElement?.updateErrorMessage({ error, insertBeforeElement: this.#submitButtonElement });
            })
                .finally(() => {
                this.#submitButtonElement?.classList.remove('loading');
            });
        }
    }
    window.customElements.define('theme-main-activate-account', ThemeMainActivateAccount);
});
