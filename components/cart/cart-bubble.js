defineModule('theme-cart-bubble', () => {
    class ThemeCartBubble extends BaseElement {
        constructor() {
            super();
            Cart.registerInstance(this);
            if (Cart.cartAddType === 'drawer' && !Cart.inCartPage) {
                this.addEventListener('click', () => {
                    themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.OpenCart, {
                        detail: {
                            refresh: false,
                        },
                    }));
                });
            }
            this.#fetchCartCount();
        }
        get #sectionNames() {
            return this.getRenderConfigs().map((item) => item.section);
        }
        replaceElement(newDocuments) {
            this.#sectionNames.forEach((sectionName) => {
                Cart.replaceHTML(this, newDocuments[sectionName], Cart.getSectionSelectors(sectionName, this.getRenderConfigs()));
            });
        }
        open() { }
        getRenderConfigs() {
            return [
                {
                    section: 'cart-bubble',
                    selectors: ['.cart-bubble__count'],
                },
            ];
        }
        #fetchCartCount() {
            const method = 'GET';
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            };
            fetch(`${window.routes.cartCountUrl}`, { method, headers })
                .then((response) => response.text())
                .then((responseBody) => {
                const data = JSON.parse(responseBody);
                if (data.message) {
                    return;
                }
                const { count } = data;
                const countElement = this.querySelector('.cart-bubble__count');
                if (countElement && count > 0) {
                    if (count > 99) {
                        countElement.innerHTML = '99+';
                    }
                    else {
                        countElement.innerHTML = count;
                    }
                }
            });
        }
    }
    window.customElements.define('theme-cart-bubble', ThemeCartBubble);
});
