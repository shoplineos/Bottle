defineModule('theme-card-address', () => {
    class ThemeCardAddress extends BaseElement {
        #removeButtonElements;
        constructor() {
            super();
            this.#removeButtonElements = this.querySelectorAll('.card-address__list-remove');
            this.#removeButtonElements.forEach((item) => {
                item.addEventListener('click', this.#removeAddressHandler.bind(this));
            });
        }
        #removeAddressHandler(event) {
            event.preventDefault();
            const currentTarget = event.currentTarget;
            const confirmText = currentTarget.getAttribute('data-confirm-message') || '';
            const confirm = window.confirm(confirmText);
            if (confirm) {
                const formId = currentTarget.getAttribute('data-form-id') || '';
                const targetForm = document.getElementById(formId);
                if (targetForm) {
                    targetForm.submit();
                }
            }
        }
    }
    window.customElements.define('theme-card-address', ThemeCardAddress);
});
