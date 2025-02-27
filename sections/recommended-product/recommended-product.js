defineModule('theme-recommended-product', () => {
    class ThemeRecommendedProduct extends VisibleElement {
        constructor() {
            super();
            this.dataset.rootMargin = '0px 0px 400px 0px';
            this.addEventListener('custom:visible', this.#render.bind(this), {
                once: true,
            });
        }
        async #render() {
            try {
                const response = await fetch(this.dataset.url);
                const responseText = await response.text();
                const domParser = new DOMParser();
                const responseHTML = domParser.parseFromString(responseText, 'text/html');
                const recommendations = responseHTML.querySelector('theme-recommended-product');
                if (recommendations) {
                    this.innerHTML = recommendations?.innerHTML;
                    const SHOPLINEstyle = responseHTML?.querySelector(`style[${window.Shopline.styleSelector.local}]`);
                    if (SHOPLINEstyle) {
                        document.head.append(SHOPLINEstyle);
                    }
                    themeUtils.execDomScript(this);
                }
            }
            catch (err) {
                console.error('[theme-recommended-product]: error - ', err);
            }
        }
    }
    customElements.define('theme-recommended-product', ThemeRecommendedProduct);
});
