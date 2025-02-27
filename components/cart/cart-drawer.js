defineModule('theme-cart-drawer', () => {
    class ThemeCartDrawer extends CartItems {
        get #hasContent() {
            return !!this.querySelector('.cart-drawer__amount') || !!this.querySelector('.cart-empty');
        }
        get #sectionNames() {
            return this.getRenderConfigs().map((item) => item.section);
        }
        constructor() {
            super();
            Cart.registerInstance(this);
            this.addEventListener('modal:close', () => {
                themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.CartClosed, {
                    detail: {
                        type: 'drawer',
                    },
                }));
            });
        }
        #changeHandler = themeUtils.debounce(async (event) => {
            const { detail } = event || {};
            await this.quantityChange({ event, ...detail });
        }, 300);
        open(options = {}) {
            this.removeEventListener('change', this.#changeHandler);
            this.addEventListener('change', this.#changeHandler);
            const { refresh } = options;
            if (!refresh && !this.#hasContent) {
                this.querySelector('.cart-drawer__inner')?.classList.add('cart-drawer__inner--loading');
                Cart.update();
            }
            else if (refresh) {
                this.querySelector('.cart-drawer__inner')?.classList.add('cart-drawer__inner--loading');
                this.querySelector('.cart-drawer__fixed-checkout')?.remove();
            }
            this.querySelector('theme-modal')?.open();
            if (window.Shopline.i18nInit) {
                window.Shopline.i18nInit();
            }
            themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.CartOpened, {
                detail: {
                    type: 'drawer',
                },
            }));
        }
        replaceElement(newDocuments) {
            this.#sectionNames.forEach((sectionName) => {
                Cart.replaceHTML(this, newDocuments[sectionName], Cart.getSectionSelectors(sectionName, this.getRenderConfigs()), true);
            });
            this.querySelector('.cart-drawer__inner')?.classList.remove('cart-drawer__inner--loading');
        }
        getRenderConfigs() {
            return [
                {
                    section: 'cart-drawer',
                    selectors: ['.cart-drawer__body'],
                },
            ];
        }
    }
    window.customElements.define('theme-cart-drawer', ThemeCartDrawer);
});
