defineModule('theme-main-cart-footer', () => {
    class ThemeMainCartFooter extends VisibleElement {
        get #themeCartFixedCheckoutElement() {
            return this.querySelector('theme-cart-fixed-checkout');
        }
        constructor() {
            super();
            this.#init();
            this.addEventListener('custom:visible', () => this.#fixedCheckoutHide(), { once: false });
            this.addEventListener('custom:hidden', () => this.#fixedCheckoutShow(), { once: false });
        }
        #init() {
            Cart.registerInstance(this);
            if (this.visible) {
                this.#fixedCheckoutHide();
            }
            else {
                this.#fixedCheckoutShow();
            }
        }
        #fixedCheckoutShow() {
            this.#themeCartFixedCheckoutElement.classList.add('cart-fixed-checkout--visible');
        }
        #fixedCheckoutHide() {
            this.#themeCartFixedCheckoutElement.classList.remove('cart-fixed-checkout--visible');
        }
        get #sectionNames() {
            return this.getRenderConfigs().map((item) => item.section);
        }
        open() { }
        replaceElement(newDocuments) {
            this.#sectionNames.forEach((sectionName) => {
                Cart.replaceHTML(this, newDocuments[sectionName], Cart.getSectionSelectors(sectionName, this.getRenderConfigs()));
            });
            if (!this.visible) {
                this.#fixedCheckoutShow();
            }
        }
        getRenderConfigs() {
            return [
                {
                    section: this.getDatasetValue('sectionId', 'string'),
                    selectors: ['.main-cart-footer__inner'],
                },
            ];
        }
    }
    window.customElements.define('theme-main-cart-footer', ThemeMainCartFooter);
});
