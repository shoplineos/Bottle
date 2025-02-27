class ThemeForgotPassword extends BaseElement {
    #emailTab = this.querySelector('#EmailTab');
    #mobileTab = this.querySelector('#MobileTab');
    #form = document.querySelector('#ResetPasswordForm');
    #emailInput = document.querySelector('#ResetPasswordForm [name="customer[email]"]');
    #mobileInput = document.querySelector('#ResetPasswordForm [name="customer[phone]"]');
    #verifyCodeElement = this.querySelector('theme-input-verify-code');
    #errorMessageElement = this.querySelector('#CustomerErrorMessage');
    #submitElement = this.querySelector('#ResetPasswordFormSubmit');
    #sdkInstance;
    #loadSDK() {
        if (this.#sdkInstance) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            window.Shopline.loadFeatures([
                {
                    name: 'customer-account-api',
                    version: '0.3',
                },
            ], (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                const { customerAccount } = window.Shopline;
                if (!customerAccount) {
                    reject(new Error('CustomerAccount was not found.'));
                    return;
                }
                this.#sdkInstance = new customerAccount.PasswordNew(this.#form);
                resolve();
            });
        });
    }
    #renderErrorMessage(error) {
        if (!error) {
            this.#errorMessageElement.textContent = '';
            return;
        }
        if (typeof error === 'object' && error !== null) {
            if ('msg' in error) {
                this.#errorMessageElement.textContent = window.Shopline.t(`${error.msg}`);
                return;
            }
            if ('message' in error) {
                this.#errorMessageElement.textContent = window.Shopline.t(`${error.message}`);
            }
            return;
        }
        this.#errorMessageElement.textContent = window.Shopline.t(`${error}`);
    }
    #openEmailHandler = () => {
        this.classList.remove('mobile');
        this.classList.add('email');
        this.#mobileTab?.parentElement?.classList.remove('active');
        this.#emailTab?.parentElement?.classList.add('active');
        this.#mobileInput?.removeAttribute('name');
        this.#mobileInput?.removeAttribute('required');
        this.#emailInput?.setAttribute('name', 'customer[email]');
        this.#emailInput?.setAttribute('required', 'true');
    };
    #openMobileHandler = () => {
        this.classList.remove('email');
        this.classList.add('mobile');
        this.#emailTab?.parentElement?.classList.remove('active');
        this.#mobileTab?.parentElement?.classList.add('active');
        this.#emailInput?.removeAttribute('name');
        this.#emailInput?.removeAttribute('required');
        this.#mobileInput?.setAttribute('name', 'customer[phone]');
        this.#mobileInput?.setAttribute('required', 'true');
    };
    #sendVerifyCodeHandler = async () => {
        if (this.#emailTab?.parentElement?.classList.contains('active')) {
            if (this.#emailInput && !this.#emailInput.checkValidity()) {
                this.#form.reportValidity();
                return;
            }
        }
        else if (this.#mobileInput && !this.#mobileInput.checkValidity()) {
            this.#form.reportValidity();
            return;
        }
        await this.#loadSDK();
        const { verifyCodeTimer } = this.#verifyCodeElement;
        if (!verifyCodeTimer.done()) {
            return;
        }
        verifyCodeTimer.start();
        try {
            const response = await this.#sdkInstance.sendVerifyCode();
            if (response && response.errorMessage) {
                verifyCodeTimer.stop();
                this.#renderErrorMessage(response.errorMessage);
            }
        }
        catch (error) {
            verifyCodeTimer.stop();
            this.#renderErrorMessage(error);
        }
    };
    #submitHandler = async (event) => {
        event.preventDefault();
        if (!this.#form.reportValidity()) {
            return;
        }
        if (this.#submitElement.classList.contains('loading')) {
            return;
        }
        this.#submitElement.classList.add('loading');
        this.#renderErrorMessage();
        try {
            await this.#loadSDK();
            await this.#sdkInstance?.submit();
            window.location.href = window.routes.accountLoginUrl;
        }
        catch (error) {
            this.#renderErrorMessage(error);
        }
        finally {
            this.#submitElement.classList.remove('loading');
        }
    };
    mounted() {
        if (window.Shopline.i18nInit) {
            window.Shopline.i18nInit();
        }
        this.#emailTab?.addEventListener('click', this.#openEmailHandler);
        this.#mobileTab?.addEventListener('click', this.#openMobileHandler);
        if (this.#emailTab) {
            this.#emailTab.click();
        }
        else if (this.#mobileTab) {
            this.#mobileTab.click();
        }
        this.addEventListener('verifyCode:send', this.#sendVerifyCodeHandler);
        this.#submitElement.addEventListener('click', this.#submitHandler);
    }
}
customElements.define('theme-forgot-password', ThemeForgotPassword);
