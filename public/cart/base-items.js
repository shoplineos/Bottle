class CartItems extends BaseElement {
    #key = '';
    #keyIndex = 0;
    #updateBeforeTotalProductQuantity = 0;
    get #currentKeyItemElement() {
        return this.querySelectorAll(`[data-key="${this.#key}"]`)[this.#keyIndex];
    }
    get #currentKeyItemAllSameElements() {
        return this.querySelectorAll(`[data-key="${this.#key}"]`);
    }
    constructor() {
        super();
        this.#updateBeforeTotalProductQuantity = this.#getAllProductQuantity();
    }
    async quantityChange(options) {
        const { event, mode } = options;
        const targetItem = event.target.closest('.cart-item');
        if (!targetItem) {
            throw new Error('Key is not found');
        }
        const { key } = targetItem.dataset;
        if (!key) {
            throw new Error('Key is not found');
        }
        this.#key = key;
        const currentItemAllSameQuantity = this.#getCurrentKeyAllSameQuantity();
        let updateCount = currentItemAllSameQuantity;
        this.#keyIndex = Array.from(this.#currentKeyItemAllSameElements).findIndex((item) => item === targetItem);
        if (mode === 'remove') {
            const currentItemQuantity = this.#getCurrentKeyItemQuantity();
            updateCount = currentItemAllSameQuantity - currentItemQuantity;
        }
        this.#fetchChange(key, updateCount);
    }
    async #fetchChange(cartItemKey, count) {
        if (!cartItemKey) {
            throw new Error('Item key is not found');
        }
        if (count < 0) {
            throw new Error('Item count is not valid');
        }
        this.#loading();
        const method = 'POST';
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        const body = JSON.stringify({
            id: cartItemKey,
            quantity: count,
        });
        fetch(`${window.routes.cartChangeUrl}`, {
            method,
            headers,
            ...{ body },
        })
            .then((response) => response.text())
            .then(async (responseBody) => {
            const data = JSON.parse(responseBody);
            if (data.message) {
                this.#setItemErrorMessage(data.message);
                return;
            }
            await Cart.update();
            const items = data.items;
            const isValid = items.some((item) => cartItemKey.split(':')[0] === item.id);
            if (!isValid) {
                return;
            }
            if (this.#updateBeforeTotalProductQuantity === data.item_count) {
                const message = window.Shopline.t('cart.cart_quantity_error', {
                    quantity: this.#getCurrentKeyItemQuantity(),
                });
                this.#setItemErrorMessage(message);
            }
            else if (count > this.#getCurrentKeyAllSameQuantity()) {
                const message = window.Shopline.t('cart.cart_quantity_error', {
                    quantity: this.#getCurrentKeyItemQuantity(),
                });
                this.#setItemErrorMessage(message);
            }
            this.#updateBeforeTotalProductQuantity = data.item_count;
        })
            .catch(() => {
            this.#setItemErrorMessage('request system error');
        })
            .finally(() => {
            this.#removeLoading();
        });
    }
    #getCurrentKeyItemQuantity() {
        return parseInt(this.#currentKeyItemElement?.querySelector('[name="quantity"]')?.value, 10);
    }
    #getCurrentKeyAllSameQuantity() {
        let sum = 0;
        this.#currentKeyItemAllSameElements.forEach((item) => {
            const quantityElement = item.querySelector('[name="quantity"]');
            if (quantityElement) {
                sum += parseInt(quantityElement.value, 10);
            }
        });
        return sum;
    }
    #getAllProductQuantity() {
        return Array.from(this.querySelectorAll(`[data-key] [name="quantity"]`)).reduce((sum, target) => sum + parseInt(target.value, 10), 0);
    }
    #setItemErrorMessage(message) {
        const errorTextElement = this.#currentKeyItemElement?.querySelector('.cart-item__fail-tip');
        if (errorTextElement) {
            errorTextElement.innerHTML = message;
        }
    }
    #loading() {
        this.querySelectorAll('.cart-item').forEach((item) => item.classList.add('cart-item__disabled'));
        this.#currentKeyItemAllSameElements.forEach((item) => {
            item.querySelectorAll('.cart-item__total-loading').forEach((loading) => loading.classList.add('loading'));
        });
    }
    #removeLoading() {
        this.querySelectorAll('.cart-item').forEach((item) => item.classList.remove('cart-item__disabled'));
        this.#currentKeyItemAllSameElements.forEach((item) => {
            item.querySelectorAll('.cart-item__total-loading').forEach((loading) => loading.classList.remove('loading'));
        });
    }
}
