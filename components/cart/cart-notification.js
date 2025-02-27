defineModule('theme-cart-notification', () => {
    class ThemeCartNotification extends BaseElement {
        #currentShowItemKey = '';
        #cartNotificationElement = null;
        constructor() {
            super();
            this.#cartNotificationElement = this.querySelector('.cart-notification');
            Cart.registerInstance(this);
            themeEventCenter.addListener(EnumThemeEvent.VariantAdded, (event) => {
                const { lineItemKey } = event.detail;
                this.#currentShowItemKey = lineItemKey;
            });
            this.addEventListener('modal:close', () => {
                themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.CartClosed, {
                    detail: {
                        type: 'notification',
                    },
                }));
                setTimeout(() => {
                    if (this.#cartNotificationElement) {
                        this.#cartNotificationElement.classList.add('loading');
                    }
                }, 200);
            });
        }
        get #sectionNames() {
            return this.getRenderConfigs().map((item) => item.section);
        }
        async open() {
            if (this.#currentShowItemKey) {
                this.#currentShowItemKey = '';
                await this.querySelector('theme-modal')?.open();
                this.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
            }
            else {
                console.warn('No items added to cart');
            }
        }
        replaceElement(newDocuments, options) {
            this.#sectionNames.forEach((sectionName) => {
                if (sectionName !== 'cart-notification-product') {
                    Cart.replaceHTML(this, newDocuments[sectionName], Cart.getSectionSelectors(sectionName, this.getRenderConfigs()));
                }
                else {
                    const { lineItemKey } = options || {};
                    const itemListElement = this.querySelector('.cart-notification__items');
                    const newElement = document.createElement('div');
                    const itemElement = newDocuments[sectionName]?.querySelector(`.cart-item[data-key="${lineItemKey}"]`);
                    newElement.classList.add('cart-notification__items');
                    if (itemElement) {
                        newElement.appendChild(itemElement);
                    }
                    if (itemListElement && newElement) {
                        itemListElement.replaceWith(newElement);
                    }
                }
            });
            if (this.#cartNotificationElement) {
                this.#cartNotificationElement.classList.remove('loading');
            }
            themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.CartOpened, {
                detail: {
                    type: 'notification',
                },
            }));
        }
        getRenderConfigs() {
            return [
                {
                    section: 'cart-notification',
                    selectors: ['.cart-notification__subtotal', '.cart-notification__buttons'],
                },
                {
                    section: 'cart-notification-product',
                    selectors: [],
                },
            ];
        }
    }
    window.customElements.define('theme-cart-notification', ThemeCartNotification);
});
