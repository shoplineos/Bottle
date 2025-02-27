defineModule('theme-base-form', () => {
    class BaseForm extends BaseElement {
        formElement;
        #CONSTANT = {
            FIELD_CLASS: 'field',
            ERROR_FIELD_CLASS: 'field--error',
            ERROR_FIELD_INFO_CLASS: 'field__info--error',
            FORM_ERROR_CLASS: 'form__error-message',
        };
        constructor() {
            super();
            this.formElement = this.querySelector('form');
            if (!this.formElement) {
                throw new Error('BaseForm: form element not found');
            }
            this.#bindInputFocusHandler();
        }
        clearAllErrorMessage(options) {
            const newOptions = options || { resetForm: true };
            const errorFieldElements = this.formElement?.querySelectorAll(`.${this.#CONSTANT.ERROR_FIELD_CLASS}`);
            const errorFieldInfoElements = this.formElement?.querySelectorAll(`.${this.#CONSTANT.ERROR_FIELD_INFO_CLASS}`);
            const formErrorElements = this.formElement?.querySelectorAll(`.${this.#CONSTANT.FORM_ERROR_CLASS}`);
            if (newOptions.resetForm) {
                this.formElement?.reset();
            }
            errorFieldElements?.forEach((element) => {
                element.classList.remove(this.#CONSTANT.ERROR_FIELD_CLASS);
            });
            errorFieldInfoElements?.forEach((element) => {
                element.remove();
            });
            formErrorElements?.forEach((element) => {
                element.remove();
            });
        }
        updateErrorMessage(options) {
            const { error, i18nHash } = options;
            const { error_fields: errorFields } = error;
            console.log('error', error);
            if (error.msg) {
                error.msg = window.Shopline.t(error.msg, { ...i18nHash });
            }
            if (error.message) {
                error.message = window.Shopline.t(error.message, { ...i18nHash });
            }
            this.clearAllErrorMessage({ resetForm: false });
            if (errorFields) {
                const inputElement = this.formElement?.querySelector(`input[name="${errorFields[0]}"]`);
                const errorElement = themeUtils.createDom(`<div class="${this.#CONSTANT.ERROR_FIELD_INFO_CLASS}">${error.msg || error.message}</div>`);
                if (inputElement) {
                    const errorFieldElement = inputElement.closest(`.${this.#CONSTANT.FIELD_CLASS}`);
                    errorFieldElement?.classList.add(this.#CONSTANT.ERROR_FIELD_CLASS);
                    this.#insertElement({
                        errorElement,
                        targetElement: errorFieldElement,
                        selector: `.${this.#CONSTANT.ERROR_FIELD_INFO_CLASS}`,
                        insertType: 'after',
                    });
                }
            }
            else if (error.msg || error.message) {
                const { insertBeforeElement } = options;
                const errorMessage = error.msg || error.message;
                const errorElement = themeUtils.createDom(`<div class="${this.#CONSTANT.FORM_ERROR_CLASS}">${errorMessage}</div>`);
                if (!insertBeforeElement) {
                    return;
                }
                this.#insertElement({
                    errorElement,
                    targetElement: insertBeforeElement,
                    selector: `.${this.#CONSTANT.FORM_ERROR_CLASS}`,
                    insertType: 'before',
                });
            }
        }
        #insertElement(options) {
            const { errorElement, targetElement, selector, insertType } = options;
            if (!errorElement || !targetElement) {
                return;
            }
            const parentElement = targetElement.parentNode;
            if (!parentElement) {
                return;
            }
            if (parentElement.querySelector(selector)) {
                parentElement.querySelector(selector)?.remove();
            }
            if (insertType === 'after') {
                if (parentElement.lastElementChild === targetElement) {
                    parentElement.appendChild(errorElement);
                }
                else {
                    parentElement.insertBefore(errorElement, targetElement.nextElementSibling);
                }
            }
            if (insertType === 'before') {
                parentElement.insertBefore(errorElement, targetElement);
            }
        }
        #bindInputFocusHandler() {
            const allInputsElement = this.formElement?.querySelectorAll('input');
            if (!allInputsElement) {
                return;
            }
            allInputsElement.forEach((item) => {
                item.addEventListener('focus', (event) => {
                    const target = event.target;
                    const fieldElement = target.closest(`.${this.#CONSTANT.FIELD_CLASS}`);
                    const errorElement = fieldElement?.nextElementSibling;
                    if (fieldElement?.classList.contains(this.#CONSTANT.ERROR_FIELD_CLASS)) {
                        fieldElement?.classList.remove(this.#CONSTANT.ERROR_FIELD_CLASS);
                    }
                    if (errorElement?.classList.contains(this.#CONSTANT.ERROR_FIELD_INFO_CLASS)) {
                        errorElement?.remove();
                    }
                });
            });
        }
    }
    window.customElements.define('theme-base-form', BaseForm);
    window.BaseForm = BaseForm;
});
