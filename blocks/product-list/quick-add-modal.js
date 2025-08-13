defineModule('theme-quick-add-to-cart', () => {
    class QuickAddModal extends Modal {
        #productUrl;
        #contentElement;
        #summaryElement;
        constructor() {
            super();
            this.#productUrl = this.getAttribute('product-url');
            this.#contentElement = this.querySelector('.block-product-card__modal-content');
            this.#summaryElement = this.querySelector('summary');
            themeEventCenter.addListener(EnumThemeEvent.VariantAdded, (event) => {
                if (event.target && this.#contentElement.contains(event.target)) {
                    this.close();
                }
            });
        }
        async open() {
            try {
                this.#summaryElement.classList.add('loading');
                const response = await themeUtils.fetchWithCache(this.#productUrl);
                const htmlText = await response.text();
                const domParser = new DOMParser();
                const responseHTML = domParser.parseFromString(htmlText, 'text/html');
                this.#insertHTML(responseHTML);
                if (window.Shopline && window.Shopline.PaymentButton) {
                    window.Shopline.PaymentButton.init();
                }
                await super.open();
            }
            catch (error) {
                console.error(error);
            }
            finally {
                this.#summaryElement.classList.remove('loading');
            }
        }
        async close() {
            window.ThemeVideoMedia?.pauseAll();
            await super.close();
        }
        #insertHTML(responseHTML) {
            responseHTML?.querySelectorAll(`style[${window.Shopline.styleSelector.local}]`).forEach((style) => {
                document.body.append(style);
            });
            const productHTML = responseHTML.querySelector('theme-product-detail');
            this.#disabledFeature(productHTML);
            this.#renameFormId(productHTML);
            this.#contentElement.innerHTML = productHTML.outerHTML;
            themeUtils.execDomScript(this.#contentElement);
        }
        #disabledFeature(dom) {
            dom.setAttribute('data-update-url', 'false');
            const mediaGallery = dom.querySelector('theme-product-media-gallery');
            mediaGallery?.setAttribute('data-disabled-preview', 'true');
        }
        #renameFormId(dom) {
            const formId = 'product-form-template--product__main-product-info';
            const newFormId = `product-form-template--${themeUtils.generateUUID()}`;
            const form = dom.querySelector(`#${formId}`);
            const formInputs = dom.querySelectorAll(`[form="${formId}"]`);
            form?.setAttribute('id', newFormId);
            formInputs.forEach((input) => input.setAttribute('form', newFormId));
        }
    }
    customElements.define('theme-quick-add-modal', QuickAddModal);
});
