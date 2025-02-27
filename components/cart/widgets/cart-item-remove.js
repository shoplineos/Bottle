defineModule('theme-cart-item-remove', () => {
    class ThemeCartItemRemove extends HTMLElement {
        constructor() {
            super();
            this.#init();
        }
        #init() {
            this.addEventListener('click', () => {
                const eventOptions = {
                    detail: { mode: 'remove' },
                    bubbles: true,
                };
                const changeEvent = new CustomEvent('change', eventOptions);
                this.dispatchEvent(changeEvent);
            });
        }
    }
    window.customElements.define('theme-cart-item-remove', ThemeCartItemRemove);
});
