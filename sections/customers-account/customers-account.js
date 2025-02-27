defineModule('theme-customers-account', () => {
    class ThemeCustomersAccount extends Customer {
        #cardTitleEditElement;
        #cardCancelElement;
        #childComponentInstanceMap = {};
        constructor() {
            super();
            this.#cardTitleEditElement = this.querySelectorAll('.card__title-edit');
            this.#cardCancelElement = this.querySelectorAll('.card__cancel');
            if (this.#cardTitleEditElement.length) {
                this.#cardTitleEditElement.forEach((element) => {
                    element.addEventListener('click', () => this.#editHandler(element));
                });
            }
            if (this.#cardCancelElement.length) {
                this.#cardCancelElement.forEach((element) => {
                    element.addEventListener('click', () => this.#cancelHandler(element));
                });
            }
            this.#init();
        }
        registerInstance(scene, instance) {
            this.#childComponentInstanceMap[scene] = instance;
        }
        async #init() {
            this.loadToastSDK();
            await this.loadCustomerAccountSDK();
            Object.values(this.#childComponentInstanceMap).forEach((childInstance) => {
                childInstance.init();
            });
        }
        #editHandler(targetElement) {
            const containerElement = targetElement.closest('.card');
            if (containerElement) {
                this.#toggle(containerElement);
            }
        }
        #cancelHandler(targetElement) {
            const containerElement = targetElement.closest('.card');
            if (containerElement) {
                this.#toggle(containerElement);
            }
        }
        #toggle(containerElement) {
            const editHideElement = containerElement?.querySelectorAll('[data-edit-hide]');
            const editShowElement = containerElement?.querySelectorAll('[data-edit-show]');
            if (editHideElement?.length) {
                Array.from(editHideElement).forEach((item) => {
                    item.classList.toggle('hidden');
                });
            }
            if (editShowElement?.length) {
                Array.from(editShowElement).forEach((item) => {
                    item.classList.toggle('hidden');
                });
            }
        }
    }
    window.customElements.define('theme-customers-account', ThemeCustomersAccount);
});
