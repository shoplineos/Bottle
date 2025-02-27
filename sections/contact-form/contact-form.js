defineModule('theme-contact-form', () => {
    class ThemeContactForm extends BaseElement {
        #form;
        constructor() {
            super();
            this.#form = this.querySelector('form');
            if (!this.#form) {
                throw new Error(`ContactForm: form element not found`);
            }
            const submitElement = this.#form.querySelector("button[type='submit']");
            if (submitElement) {
                submitElement.addEventListener('click', () => this.#languageAssignment());
            }
        }
        #languageAssignment() {
            if (!this.#form) {
                throw new Error(`ContactForm: form element not found`);
            }
            const inputs = Array.from(this.#form.elements);
            const translateInputElement = this.#form.querySelector('input[name=_translate]');
            const translateRecord = {};
            if (inputs) {
                inputs.forEach((input) => {
                    const title = input.getAttribute('title') || '';
                    const name = input.getAttribute('name') || '';
                    if (name && /contact|attribute\[[\w]+\]/.test(name)) {
                        translateRecord[name] = title;
                    }
                });
            }
            if (translateInputElement) {
                translateInputElement.setAttribute('value', JSON.stringify(translateRecord));
            }
        }
    }
    window.customElements.define('theme-contact-form', ThemeContactForm);
});
