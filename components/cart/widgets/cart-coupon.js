defineModule('theme-cart-coupon', () => {
    class ThemeCartCoupon extends BaseElement {
        #inputElement;
        #submitButtonElement;
        #couponListElement;
        #errorElement;
        constructor() {
            super();
            this.#inputElement = this.querySelector('input');
            this.#submitButtonElement = this.querySelector('.cart-coupon__button');
            this.#couponListElement = this.querySelector('.cart-coupon__list');
            this.#errorElement = this.querySelector('.cart-coupon__error');
            this.#init();
        }
        #init() {
            this.#bindCloseEvent();
            this.#bindSubmitEvent();
        }
        #bindCloseEvent() {
            this.#couponListElement.addEventListener('click', themeUtils.debounce((event) => {
                const target = event.target || null;
                if (!target) {
                    return;
                }
                const closeButtonElement = target.closest('.cart-coupon__list-close');
                const item = target.closest('.cart-coupon__list-item');
                if (closeButtonElement && item) {
                    const { code = '' } = item.dataset;
                    this.#disabled();
                    this.#remove(code)
                        .then((res) => res.json())
                        .then(async (res) => {
                        if (res.message) {
                            this.#showError(res.message, false);
                            return;
                        }
                        await Cart.update();
                    })
                        .catch(() => {
                        this.#showError('request error', false);
                    })
                        .finally(() => {
                        this.#removeDisabled();
                    });
                }
            }, 300));
        }
        #bindSubmitEvent() {
            this.#inputElement.addEventListener('keyup', themeUtils.debounce((event) => {
                if (event.code === 'Enter') {
                    this.#submit(event);
                }
            }, 300));
            this.#submitButtonElement.addEventListener('click', themeUtils.debounce(this.#submit.bind(this), 300));
        }
        #submit(event) {
            event.preventDefault();
            const code = this.#inputElement.value.trim();
            if (!code) {
                return;
            }
            this.#loading();
            this.#apply(code)
                .then((res) => res.json())
                .then(async (res) => {
                if (res.message) {
                    this.#showError(res.message);
                    return;
                }
                await Cart.update();
            })
                .catch(() => {
                this.#showError('request error');
            })
                .finally(() => {
                this.#removeLoading();
            });
        }
        async #apply(code) {
            return fetch(window.routes.cartDiscountCodeApplyUrl, this.#constructorConfigs(code));
        }
        async #remove(code) {
            return fetch(window.routes.cartDiscountCodeRemoveUrl, this.#constructorConfigs(code));
        }
        #constructorConfigs(code) {
            const method = 'POST';
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            };
            const body = JSON.stringify({ code });
            return { method, headers, body };
        }
        #disabled() {
            this.classList.add('cart-coupon--disabled');
        }
        #removeDisabled() {
            this.classList.remove('cart-coupon--disabled');
        }
        #loading() {
            this.#disabled();
            this.#submitButtonElement.classList.add('loading');
        }
        #removeLoading() {
            this.#removeDisabled();
            this.#submitButtonElement.classList.remove('loading');
        }
        #showError(message, highlight = true) {
            const inputParentElement = this.#inputElement.closest('.field');
            if (inputParentElement && highlight) {
                inputParentElement.classList.add('field--error');
            }
            this.#errorElement.innerHTML = message;
        }
    }
    window.customElements.define('theme-cart-coupon', ThemeCartCoupon);
});
