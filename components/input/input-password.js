defineModule('theme-input-password', () => {
    class ThemeInputPassword extends BaseElement {
        #buttonElement = null;
        #inputElement = null;
        constructor() {
            super();
            this.#buttonElement = this.querySelector('.input-password__button');
            this.#inputElement = this.querySelector('input[type="password"]');
            if (this.#buttonElement) {
                const showButtonElement = this.#buttonElement.querySelector('.input-password__icon-show');
                const hideButtonElement = this.#buttonElement.querySelector('.input-password__icon-hide');
                this.#buttonElement.addEventListener('click', () => {
                    if (this.#inputElement) {
                        if (this.#inputElement.type === 'password') {
                            this.#inputElement.type = 'text';
                            showButtonElement.classList.add('hidden');
                            hideButtonElement.classList.remove('hidden');
                        }
                        else {
                            this.#inputElement.type = 'password';
                            showButtonElement.classList.remove('hidden');
                            hideButtonElement.classList.add('hidden');
                        }
                    }
                });
            }
        }
    }
    window.customElements.define('theme-input-password', ThemeInputPassword);
});
