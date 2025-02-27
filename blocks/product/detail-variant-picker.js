defineModule('theme-variant-picker', () => {
    class VariantPicker extends BaseElement {
        variants;
        constructor() {
            super();
            this.variants = this.#getVariantData();
        }
        get options() {
            return [];
        }
        get currentVariant() {
            const { options } = this;
            return this.variants.find((variant) => variant.options.every((option, index) => option === options[index]));
        }
        #getVariantData() {
            const jsonStr = this.querySelector('script[name="variant-data"][type="application/json"]')?.textContent?.trim() || '{}';
            return JSON.parse(jsonStr);
        }
    }
    class VariantRadioPicker extends VariantPicker {
        get options() {
            return Array.from(this.querySelectorAll('fieldset input[type="radio"]:checked')).map((input) => input.value);
        }
    }
    class VariantSelectPicker extends VariantPicker {
        get options() {
            return Array.from(this.querySelectorAll('select')).map((select) => select.value);
        }
    }
    customElements.define('theme-variant-radio-picker', VariantRadioPicker);
    customElements.define('theme-variant-select-picker', VariantSelectPicker);
});
