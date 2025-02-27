defineModule('theme-card-account-delete', () => {
    class ThemeCardAccountDelete extends BaseForm {
        #parentElement;
        #submitButtonElement;
        #verifyCodeElement;
        #actionsElement;
        #deleteInstance;
        constructor() {
            super();
            this.#parentElement = this.closest('theme-customers-account');
            this.#verifyCodeElement = this.querySelector('theme-input-verify-code');
            this.#submitButtonElement = this.querySelector('button[type="submit"]');
            this.#actionsElement = this.querySelector('.modify-modal__actions');
            if (!this.#parentElement) {
                throw new Error('ThemeCardAccountDelete: Parent component not found');
            }
            if (this.formElement) {
                this.#parentElement.registerInstance('delete', this);
            }
        }
        init() {
            this.#deleteInstance = new window.Shopline.customerAccount.DeleteCustomer(this.formElement);
            this.formElement?.addEventListener('submit', this.#onSubmitHandler.bind(this));
            if (this.#verifyCodeElement) {
                this.addEventListener('verifyCode:send', () => this.#send());
            }
            this.addEventListener('modal:close', this.#onModalCloseHandler.bind(this));
        }
        #send() {
            if (!this.#verifyCodeElement) {
                throw new Error('ThemeCardAccountDelete: verifyCodeElement not found');
            }
            const { verifyCodeTimer } = this.#verifyCodeElement;
            if (!verifyCodeTimer.done())
                return;
            verifyCodeTimer.start();
            this.#deleteInstance
                .sendVerifyCode()
                .then((response) => {
                if (response.errorMessage) {
                    verifyCodeTimer.stop();
                }
            })
                .catch((error) => {
                verifyCodeTimer.stop();
                this.updateErrorMessage({ error, insertBeforeElement: this.#actionsElement });
            });
        }
        #onSubmitHandler(event) {
            event.preventDefault();
            this.#submitButtonElement?.classList.add('loading');
            this.#deleteInstance
                .submit()
                .then(() => {
                console.log('Account deleted successfully');
                window.location.reload();
            })
                .catch((error) => {
                this.updateErrorMessage({ error, insertBeforeElement: this.#actionsElement });
            })
                .finally(() => {
                this.#submitButtonElement?.classList.remove('loading');
            });
        }
        #onModalCloseHandler() {
            const { verifyCodeTimer } = this.#verifyCodeElement;
            if (verifyCodeTimer) {
                verifyCodeTimer.stop();
            }
            this.clearAllErrorMessage();
        }
    }
    window.customElements.define('theme-card-account-delete', ThemeCardAccountDelete);
});
