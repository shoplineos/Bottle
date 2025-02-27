defineModule('theme-input-verify-code', () => {
    class ThemeInputVerifyCode extends VisibleElement {
        #buttonElement = null;
        verifyCodeTimer = {};
        constructor() {
            super();
            this.#buttonElement = this.querySelector('.input-verify-code__button');
            if (this.#buttonElement) {
                this.verifyCodeTimer = this.#getVerifyCodeTimer();
                this.#buttonElement.addEventListener('click', themeUtils.debounce(() => {
                    this.send();
                }, 300));
            }
            if (window.Shopline.i18nInit) {
                window.Shopline.i18nInit();
            }
        }
        send() {
            const eventOptions = { bubbles: true };
            const sendEvent = new CustomEvent('verifyCode:send', eventOptions);
            this.dispatchEvent(sendEvent);
        }
        get #totalCountdown() {
            const { totalCountdown } = this.dataset;
            return totalCountdown ? Number(totalCountdown) : 60;
        }
        #getVerifyCodeTimer() {
            let count = this.#totalCountdown;
            let timer = null;
            const self = this;
            return {
                count,
                done() {
                    return count <= 0 || count === self.#totalCountdown;
                },
                stop() {
                    if (timer) {
                        clearInterval(timer);
                        timer = null;
                    }
                    count = self.#totalCountdown;
                    if (self.#buttonElement) {
                        self.#buttonElement.removeAttribute('disabled');
                        self.#buttonElement.innerText = String(count);
                        self.#buttonElement.innerText = window.Shopline.t('customer.general.send');
                    }
                },
                start() {
                    if (timer)
                        return;
                    if (self.#buttonElement) {
                        self.#buttonElement.innerText = `${window.Shopline.t('customer.general.resend')} (${count})`;
                        self.#buttonElement.setAttribute('disabled', 'true');
                    }
                    timer = window.setInterval(() => {
                        count -= 1;
                        if (self.#buttonElement) {
                            self.#buttonElement.innerText = `${window.Shopline.t('customer.general.resend')} (${count})`;
                        }
                        if (this.done()) {
                            this.stop();
                        }
                    }, 1000);
                },
            };
        }
    }
    window.customElements.define('theme-input-verify-code', ThemeInputVerifyCode);
});
