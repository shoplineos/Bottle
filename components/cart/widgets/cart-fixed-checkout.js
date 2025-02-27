defineModule('theme-cart-fixed-checkout', () => {
    class ThemeCartFixedCheckout extends BaseElement {
        #dropdownElement;
        #totalToggleBar;
        constructor() {
            super();
            const collapsedClassString = 'cart-fixed-checkout--collapsed';
            this.#dropdownElement = this.querySelector('.cart-fixed-checkout__dropdown');
            this.#totalToggleBar = this.querySelector('.cart-fixed-checkout__total');
            if (this.#dropdownElement) {
                this.#dropdownElement.addEventListener('click', () => {
                    this.classList.toggle(collapsedClassString);
                });
            }
            if (this.#totalToggleBar) {
                this.#totalToggleBar.addEventListener('click', () => {
                    this.classList.toggle(collapsedClassString);
                });
            }
        }
    }
    window.customElements.define('theme-cart-fixed-checkout', ThemeCartFixedCheckout);
});
