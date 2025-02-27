defineModule('theme-product-form', () => {
    class ThemeProductForm extends BaseElement {
        formElement;
        #variantIdInputElement;
        #submitButtonElement;
        constructor() {
            super();
            const form = this.querySelector('form');
            if (!form) {
                throw new Error('[theme-product-form]: product form does not exist!');
            }
            this.formElement = form;
            this.formElement.addEventListener('submit', this.#submitHandler.bind(this));
            this.#variantIdInputElement = form.elements.namedItem('id');
            this.#submitButtonElement = form.querySelector('button[type="submit"]');
        }
        get disabled() {
            return this.#submitButtonElement?.disabled || false;
        }
        set disabled(force) {
            if (this.#submitButtonElement) {
                this.#submitButtonElement.disabled = force;
            }
        }
        get loading() {
            return this.#submitButtonElement?.classList.contains('loading') || false;
        }
        set loading(force) {
            this.#submitButtonElement?.classList.toggle('loading', force);
        }
        set error(message) {
            const errorMessageElement = this.querySelector('.form__error-message');
            if (!errorMessageElement) {
                return;
            }
            errorMessageElement.classList.toggle('hidden', !message);
            errorMessageElement.dataset.message = message || '';
        }
        get variantId() {
            return this.#variantIdInputElement.value;
        }
        set variantId(id) {
            const input = this.#variantIdInputElement;
            input.value = id;
            const eventOptions = { bubbles: true };
            const event = new Event('change', eventOptions);
            input.dispatchEvent(event);
        }
        updateVariant(variant) {
            this.error = '';
            this.variantId = variant?.id ?? '';
            if (!variant) {
                this.#updateSubmitButtonStatus(true, this.dataset.unavailableText);
                return;
            }
            if (!variant.available) {
                this.#updateSubmitButtonStatus(true, this.dataset.soldOutText);
                return;
            }
            this.#updateSubmitButtonStatus(false);
        }
        #updateSubmitButtonStatus(disabled, text) {
            this.disabled = disabled;
            const submitButtonTextElement = this.#submitButtonElement?.querySelector('span');
            const statusText = text ?? this.dataset.addToCartText;
            if (submitButtonTextElement && statusText) {
                submitButtonTextElement.textContent = statusText;
            }
        }
        async #submitHandler(event) {
            event.preventDefault();
            event.stopPropagation();
            if (this.disabled || this.loading) {
                return;
            }
            this.error = '';
            this.loading = true;
            try {
                const method = 'POST';
                const headers = {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                };
                const formData = this.#getFormData();
                const response = await fetch(`${window.routes.cartAddUrl}`, {
                    method,
                    headers,
                    body: formData,
                });
                const responseData = await response.json();
                if (responseData.message) {
                    this.error = responseData.message;
                    return;
                }
                const quantity = Number(formData.get('quantity') || 1);
                const eventDetail = {
                    productId: responseData.product_id,
                    productHandle: responseData.handle,
                    variantId: responseData.id,
                    quantity,
                    price: responseData.price * quantity,
                    currency: window.Shopline.currency,
                    lineItemKey: responseData.key,
                };
                themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.VariantAdded, {
                    target: this,
                    detail: eventDetail,
                }));
                themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.OpenCart, {
                    detail: {
                        refresh: true,
                    },
                }));
            }
            catch {
                this.error = this.dataset.defaultErrorMessage;
            }
            finally {
                this.loading = false;
            }
        }
        #getFormData() {
            const formData = new FormData(this.formElement);
            if (!formData.has('quantity')) {
                formData.set('quantity', '1');
            }
            formData.delete('returnTo');
            return formData;
        }
    }
    customElements.define('theme-product-form', ThemeProductForm);
});
