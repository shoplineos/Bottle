defineModule('theme-input-phone', () => {
    class ThemeInputPhone extends BaseElement {
        #countrySelectElement = null;
        constructor() {
            super();
            this.#countrySelectElement = this.querySelector('.country-select__dropdown');
            if (this.#countrySelectElement) {
                const labelElement = this.querySelector('.country-select__label');
                this.#countrySelectElement.addEventListener('change', (event) => {
                    labelElement.innerText = `+${event.target.value}`;
                });
                const currentCountryElement = this.#countrySelectElement.querySelector('option');
                if (currentCountryElement) {
                    this.#countrySelectElement.value = currentCountryElement.value;
                    labelElement.innerText = `+${currentCountryElement.value}`;
                }
            }
        }
    }
    window.customElements.define('theme-input-phone', ThemeInputPhone);
});
