defineModule('theme-main-login', () => {
    class ThemeMainLogin extends Customer {
        #formElement;
        #baseFormElement;
        #submitButtonElement;
        #verifyCodeElement;
        #loginInstance;
        constructor() {
            super();
            this.#baseFormElement = this.querySelector('theme-base-form');
            this.#formElement = this.querySelector('.customer-login__form');
            this.#submitButtonElement = this.querySelector('button[type="submit"]');
            this.#verifyCodeElement = this.querySelector('theme-input-verify-code');
            this.#init();
        }
        async #init() {
            await this.loadCustomerAccountSDK();
            if (!this.#formElement) {
                throw new Error('ThemeMainLogin: form element not found');
            }
            this.#formElement.addEventListener('submit', this.#onSubmitHandler.bind(this));
            if (this.#verifyCodeElement) {
                this.addEventListener('verifyCode:send', () => this.#send());
            }
            const thirdLoginContainer = this.#formElement.querySelector('.customer-login__third-container');
            let loginOptions = {};
            if (thirdLoginContainer) {
                loginOptions = {
                    thirdLogin: {
                        container: thirdLoginContainer,
                        handleSuccess: () => {
                            window.location.href = window.routes.accountUrl;
                        },
                        handleError: (error) => {
                            console.log(error);
                        },
                    },
                };
            }
            this.#loginInstance = new window.Shopline.customerAccount.Login(this.#formElement, {
                ...loginOptions,
                activate: {
                    verifyCodeBtn: 'login-activate-send-button',
                },
            });
            this.#bindTabSwitchEvent();
        }
        #send() {
            if (!this.#verifyCodeElement) {
                throw new Error('ThemeMainLogin: verifyCodeElement not found');
            }
            const { verifyCodeTimer } = this.#verifyCodeElement;
            if (!verifyCodeTimer.done())
                return;
            verifyCodeTimer.start();
            this.#loginInstance
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
            this.#loginInstance
                .submit()
                .then(() => {
                this.#baseFormElement?.clearAllErrorMessage({ resetForm: false });
                window.location.href = window.routes.accountUrl;
            })
                .catch((error) => {
                if (error.code === 'needActivate') {
                    console.log('switch to activate step');
                    this.#baseFormElement?.clearAllErrorMessage({ resetForm: false });
                    this.#switchToActivateStep();
                }
                else {
                    console.log('login failed', error);
                    this.#baseFormElement?.updateErrorMessage({ error, insertBeforeElement: this.#submitButtonElement });
                }
            })
                .finally(() => {
                this.#submitButtonElement?.classList.remove('loading');
            });
        }
        #switchToActivateStep() {
            const titleElement = this.querySelector('.customer__title');
            const tipsElement = this.querySelector('.customer-login__activation-tips');
            const formValue = this.#loginInstance.getFormValue();
            const accountFieldName = this.#loginInstance.getAccountFieldName();
            this.#send();
            if (tipsElement) {
                tipsElement.innerText = window.Shopline.t('customer.general.sign_in_activate', {
                    account: formValue[accountFieldName[0]],
                });
            }
            if (titleElement) {
                titleElement.innerText = window.Shopline.t('customer.general.sign_in_activate_title');
            }
            const verifyCodeInputElement = this.querySelector('theme-input-verify-code input');
            if (verifyCodeInputElement) {
                verifyCodeInputElement.toggleAttribute('required', true);
                verifyCodeInputElement.removeAttribute('disabled');
            }
            const normalElements = this.querySelectorAll('[data-step-type="normal"]');
            const activateElements = this.querySelectorAll('[data-step-type="activate"]');
            Array.from(normalElements).forEach((element) => element.classList.add('hidden'));
            Array.from(activateElements).forEach((element) => element.classList.remove('hidden'));
        }
        #bindTabSwitchEvent() {
            const tabContainerElement = this.querySelector('.customer__tab');
            const emailTabElement = tabContainerElement && tabContainerElement.querySelector('span[data-login-type="email"]');
            const mobileTabElement = tabContainerElement && tabContainerElement.querySelector('span[data-login-type="mobile"]');
            const emailElement = this.querySelector('div[data-login-type="email"]');
            const mobileElement = this.querySelector('div[data-login-type="mobile"]');
            const elementMap = { email: emailElement, mobile: mobileElement };
            const tabElementMap = { email: emailTabElement, mobile: mobileTabElement };
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
                    }
                    else {
                        input.setAttribute('name', input.getAttribute('_name') || '');
                        input.setAttribute('required', 'true');
                        input.removeAttribute('disabled');
                    }
                });
            };
            if (tabContainerElement) {
                mobileElement?.classList.add('hidden');
                omitFormItem();
                const self = this;
                tabContainerElement.querySelectorAll('span[data-login-type]').forEach((element) => {
                    element.addEventListener('click', (event) => {
                        const targetElement = event.currentTarget;
                        const type = targetElement.getAttribute('data-login-type');
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
    window.customElements.define('theme-main-login', ThemeMainLogin);
});
