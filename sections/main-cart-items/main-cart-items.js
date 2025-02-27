defineModule('theme-main-cart-items', () => {
    class ThemeMainCartItems extends CartItems {
        constructor() {
            super();
            Cart.registerInstance(this);
            this.addEventListener('change', themeUtils.debounce(async (event) => {
                const { detail } = event || {};
                await this.quantityChange({ event, ...detail });
            }, 300));
            if (window.Shopline.i18nInit) {
                window.Shopline.i18nInit();
            }
        }
        get #sectionNames() {
            return this.getRenderConfigs().map((item) => item.section);
        }
        open() { }
        replaceElement(newDocuments) {
            this.#sectionNames.forEach((sectionName) => {
                Cart.replaceHTML(this, newDocuments[sectionName], Cart.getSectionSelectors(sectionName, this.getRenderConfigs()));
            });
        }
        getRenderConfigs() {
            return [
                {
                    section: this.getDatasetValue('sectionId', 'string'),
                    selectors: ['.main-cart-items__content'],
                },
            ];
        }
    }
    window.customElements.define('theme-main-cart-items', ThemeMainCartItems);
});
