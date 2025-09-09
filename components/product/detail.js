defineModule('theme-product-detail', () => {
    class ProductDetail extends BaseElement {
        quantityInputElement;
        volumePricingElement;
        #volumePricingTipElement;
        variantPickerElement;
        shareLinkElement;
        buyFormElement;
        mediaGalleryElement;
        defaultVariant;
        get options() {
            return this.variantPickerElement?.options ?? [];
        }
        get currentVariant() {
            return this.variantPickerElement?.currentVariant;
        }
        get quantity() {
            return this.quantityInputElement?.value ?? 1;
        }
        set quantity(num) {
            if (this.quantityInputElement) {
                this.quantityInputElement.value = num;
            }
        }
        set loading(force) {
            if (this.buyFormElement) {
                this.buyFormElement.loading = force;
            }
        }
        get #themeEventInitDict() {
            const { currentVariant, defaultVariant, quantity } = this;
            const variant = currentVariant || defaultVariant;
            return {
                target: this,
                detail: {
                    productId: this.dataset.id,
                    productHandle: this.dataset.handle,
                    variantId: variant?.id,
                    quantity,
                    price: (variant?.price || 0) * quantity,
                    currency: window.Shopline.currency,
                },
            };
        }
        constructor() {
            super();
            this.quantityInputElement = this.querySelector('.product-detail__quantity-selector theme-input-number');
            this.#volumePricingTipElement = this.querySelector('.product-detail__quantity-selector .volume-pricing__tip');
            this.variantPickerElement = this.querySelector('.product-detail__variant-picker');
            this.shareLinkElement = this.querySelector('.product-detail__share theme-share-button');
            this.buyFormElement = this.querySelector('.product-detail__buy-buttons theme-product-form');
            this.mediaGalleryElement = this.querySelector('.product-detail__media-gallery');
            this.volumePricingElement = this.querySelector('.product-detail__volume-pricing');
            this.defaultVariant = this.#getDefaultVariantData();
            this.quantityInputElement?.parentElement?.addEventListener('change', this.#quantityChangeHandler.bind(this));
            this.variantPickerElement?.addEventListener('change', this.#variantChangeHandler.bind(this));
        }
        mounted() {
            themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.ProductViewed, this.#themeEventInitDict));
        }
        #getDefaultVariantData() {
            const jsonStr = this.querySelector('script[name="default-variant-data"][type="application/json"]')?.textContent?.trim() || '{}';
            return JSON.parse(jsonStr);
        }
        #quantityChangeHandler() {
            if (!this.quantityInputElement) {
                return;
            }
            this.#updateVolumePricingTip();
            themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.VariantChanged, this.#themeEventInitDict));
        }
        #variantChangeHandler() {
            if (!this.variantPickerElement) {
                return;
            }
            const { currentVariant } = this;
            const currentFeatureMedia = currentVariant?.featured_media?.id;
            if (currentFeatureMedia) {
                this.mediaGalleryElement?.activeMedia(currentFeatureMedia);
            }
            this.buyFormElement?.updateVariant(currentVariant);
            this.#updateProductInfo();
            this.#updateURL();
            themeEventCenter.dispatch(new ThemeEvent(EnumThemeEvent.VariantChanged, this.#themeEventInitDict));
        }
        async #updateProductInfo() {
            const { currentVariant } = this;
            if (!currentVariant) {
                return;
            }
            const newProductInfoElement = await this.#getProductInfoDocument(currentVariant.id);
            this.#replaceElement(newProductInfoElement, this, '.product-detail__price');
            this.#replaceElement(newProductInfoElement, this, '.product-detail__inventory');
            const { quantity } = this;
            this.#copyElementAttr(newProductInfoElement, this, '.product-detail__quantity-selector theme-input-number input', [
                'min',
                'max',
                'step',
            ]);
            this.quantity = quantity;
            this.#volumePricingTipElement = this.#replaceElement(newProductInfoElement, this, '.product-detail__quantity-selector .volume-pricing__tip');
            this.#replaceElement(newProductInfoElement, this, '.product-detail__variant-sku');
            this.volumePricingElement = this.#replaceElement(newProductInfoElement, this, '.product-detail__volume-pricing');
            this.#updateVolumePricingTip();
        }
        async #getProductInfoDocument(variantId) {
            const { sectionId, sectionTemplate, url } = this.dataset;
            const fetchUrl = new URL(url, window.location.href);
            fetchUrl.searchParams.set('sku', variantId);
            fetchUrl.searchParams.set('section_id', sectionId);
            fetchUrl.searchParams.set('section_template', sectionTemplate);
            const response = await themeUtils.fetchWithCache(fetchUrl);
            const responseText = await response.text();
            const domParser = new DOMParser();
            const responseHtml = domParser.parseFromString(responseText, 'text/html');
            return responseHtml.querySelector('theme-product-detail');
        }
        #replaceElement(destination, source, selector) {
            const oldElement = source.querySelector(selector);
            const newElement = destination.querySelector(selector);
            if (oldElement && newElement) {
                oldElement.replaceWith(newElement);
                return newElement;
            }
            return oldElement;
        }
        #copyElementAttr(destination, source, selector, attrs) {
            const oldElement = source.querySelector(selector);
            const newElement = destination.querySelector(selector);
            if (oldElement && newElement) {
                attrs.forEach((attr) => {
                    oldElement.setAttribute(attr, newElement.getAttribute(attr));
                });
            }
        }
        #updateURL() {
            const { currentVariant } = this;
            const canUpdatePageUrl = this.getDatasetValue('updateUrl', 'boolean');
            if (canUpdatePageUrl) {
                window.history.replaceState({}, document.title, themeUtils.changeURLArg(window.location.href, {
                    sku: currentVariant?.id,
                }));
            }
            this.shareLinkElement?.setAttribute('href', `${window.shopUrl}${currentVariant?.url}`);
        }
        #updateVolumePricingTip() {
            const { volumePricingElement, quantity } = this;
            const matchVolumePricing = volumePricingElement?.getMatchVolumePricing(quantity);
            if (!matchVolumePricing) {
                return;
            }
            this.#volumePricingTipElement.textContent = matchVolumePricing.price;
        }
    }
    customElements.define('theme-product-detail', ProductDetail);
});
