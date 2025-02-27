defineModule('theme-checkbox-group', () => {
    class ThemeCheckboxGroup extends BaseElement {
        constructor() {
            super();
            this.init();
        }
        get type() {
            return this.getAttribute('type') || 'checkbox';
        }
        get inputs() {
            return Array.from(this.querySelectorAll(`input[type="${this.type}"]`));
        }
        init() {
            this.#updateInputStatus();
            this.addEventListener('change', (event) => {
                const target = event.target;
                if (target.type !== this.type)
                    return;
                this.#updateInputStatus();
            });
        }
        #updateInputStatus() {
            this.inputs.forEach((radio) => {
                const label = radio.closest('label');
                const { checked } = radio;
                if (!label)
                    return;
                label[checked ? 'setAttribute' : 'removeAttribute']('checked', String(checked));
            });
        }
    }
    window.customElements.define('theme-checkbox-group', ThemeCheckboxGroup);
});
