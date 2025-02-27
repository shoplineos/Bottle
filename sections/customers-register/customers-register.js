defineModule('theme-main-register', () => {
    class ThemeMainRegister extends Customer {
        #formElement;
        #baseFormElement;
        #submitButtonElement;
        #verifyCodeElement;
        #registerInstance;
        constructor() {
            super();
            this.#baseFormElement = this.querySelector('theme-base-form');
            this.#formElement = this.querySelector('.customer-register__form');
            this.#submitButtonElement = this.querySelector('button[type="submit"]');
            this.#verifyCodeElement = this.querySelector('theme-input-verify-code');
            this.#init();
        }
        async #init() {
            await this.loadCustomerAccountSDK();
            if (!this.#formElement) {
                throw new Error('ThemeMainRegister: form element not found');
            }
            this.#formElement.addEventListener('submit', this.#onSubmitHandler.bind(this));
            if (this.#verifyCodeElement) {
                this.addEventListener('verifyCode:send', () => this.#send());
            }
            this.#registerInstance = new window.Shopline.customerAccount.Register(this.#formElement);
            this.#bindTabSwitchEvent();
        }
        #send() {
            if (!this.#verifyCodeElement) {
                throw new Error('ThemeMainRegister: verifyCodeElement not found');
            }
            const { verifyCodeTimer } = this.#verifyCodeElement;
            if (!verifyCodeTimer.done())
                return;
            verifyCodeTimer.start();
            this.#registerInstance
                .sendVerifyCode()
                .then((response) => {
                if (response.errorMessage) {
                    verifyCodeTimer.stop();
                }
            })
                .catch((error) => {
                verifyCodeTimer.stop();
                this.#baseFormElement?.updateErrorMessage({ error, insertBeforeElement: this.#submitButtonElement });
            });
        }
        #onSubmitHandler(event) {
            event.preventDefault();
            this.#submitButtonElement?.classList.add('loading');
            this.#registerInstance
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
        #bindTabSwitchEvent() {
            const tabContainerElement = this.querySelector('.customer__tab');
            const emailTabElement = tabContainerElement && tabContainerElement.querySelector('span[data-register-type="email"]');
            const mobileTabElement = tabContainerElement && tabContainerElement.querySelector('span[data-register-type="mobile"]');
            const emailElement = this.querySelector('div[data-register-type="email"]');
            const mobileElement = this.querySelector('div[data-register-type="mobile"]');
            const elementMap = { email: emailElement, mobile: mobileElement };
            const tabElementMap = { email: emailTabElement, mobile: mobileTabElement };
            const emailMarketingElement = document.querySelector('.customer-register__email-marketing');
            const emailMarketingCheckBoxElement = emailMarketingElement && emailMarketingElement.querySelector('[name="customer[accepts_marketing]"]');
            if (emailMarketingCheckBoxElement) {
                emailMarketingCheckBoxElement.setAttribute('_name', emailMarketingCheckBoxElement.getAttribute('name') || '');
            }
            const omitFormItem = () => {
                [emailElement, mobileElement].forEach((element) => {
                    const input = element?.querySelector('input');
                    if (!input) {
                        return;
                    }
                    if (!input.getAttribute('_name')) {
                        input.setAttribute('_name', input.getAttribute('name') || '');
                    }
                    if (element?.classList.contains('hidden')) {
                        input.setAttribute('name', '_');
                        input.removeAttribute('required');
                        input.setAttribute('disabled', 'true');
                        if (element === emailElement && emailMarketingElement) {
                            emailMarketingElement.classList.add('hidden');
                            emailMarketingCheckBoxElement?.setAttribute('name', '_');
                            emailMarketingCheckBoxElement?.setAttribute('disabled', 'true');
                        }
                    }
                    else {
                        input.setAttribute('name', input.getAttribute('_name') || '');
                        input.setAttribute('required', 'true');
                        input.removeAttribute('disabled');
                        if (element === emailElement && emailMarketingElement) {
                            emailMarketingElement.classList.remove('hidden');
                            emailMarketingElement.removeAttribute('disabled');
                            emailMarketingCheckBoxElement?.setAttribute('name', emailMarketingCheckBoxElement.getAttribute('_name') || '');
                            emailMarketingCheckBoxElement?.removeAttribute('disabled');
                        }
                    }
                });
            };
            if (tabContainerElement) {
                mobileElement?.classList.add('hidden');
                omitFormItem();
                const self = this;
                tabContainerElement.querySelectorAll('span[data-register-type]').forEach((element) => {
                    element.addEventListener('click', (event) => {
                        const targetElement = event.currentTarget;
                        const type = targetElement.getAttribute('data-register-type');
                        self.#baseFormElement?.clearAllErrorMessage({ resetForm: false });
                        if (targetElement.classList.contains('active') && self.#verifyCodeElement?.verifyCodeTimer) {
                            self.#verifyCodeElement.verifyCodeTimer.stop();
                        }
                        if (elementMap[type]) {
                            Object.keys(elementMap).forEach((t) => {
                                if (t === type) {
                                    elementMap[t]?.classList.remove('hidden');
                                    tabElementMap[t]?.classList.add('active');
                                }
                                else {
                                    elementMap[t]?.classList.add('hidden');
                                    tabElementMap[t]?.classList.remove('active');
                                }
                            });
                            omitFormItem();
                        }
                    });
                });
            }
        }
    }
    window.customElements.define('theme-main-register', ThemeMainRegister);
});
