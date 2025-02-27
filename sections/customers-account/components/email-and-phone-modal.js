class EmailAndPhoneModal extends BaseForm {
    #parentElement;
    #modalElement;
    #editElements;
    #verifyCodeElements;
    #nextButtonElement;
    #step1ContentElement;
    #step2ContentElement;
    #defaultContentElement;
    #step1DescElement;
    #step1ActionsElement;
    #step2ActionsElement;
    #defaultActionsElement;
    #needCheckTag;
    #accountInstance;
    set accountInstance(obj) {
        this.#accountInstance = obj;
    }
    constructor() {
        super();
        this.#parentElement = this.closest('theme-customers-account');
        this.#editElements = this.querySelectorAll('.card-account__edit');
        this.#modalElement = this.querySelector('theme-modal');
        this.#verifyCodeElements = this.querySelectorAll('theme-input-verify-code');
        this.#nextButtonElement = this.querySelector('.modify-modal__next');
        this.#step1ContentElement = this.querySelector('.modify-modal__step1');
        this.#step2ContentElement = this.querySelector('.modify-modal__step2');
        this.#defaultContentElement = this.querySelector('.modify-modal__default');
        this.#step1DescElement = this.#step1ContentElement?.querySelector('.modify-modal__desc');
        this.#step1ActionsElement = this.#step1ContentElement?.querySelector('.modify-modal__actions');
        this.#step2ActionsElement = this.#step2ContentElement?.querySelector('.modify-modal__actions');
        this.#defaultActionsElement = this.#defaultContentElement?.querySelector('.modify-modal__actions');
        this.#needCheckTag = this.formElement && this.formElement.getAttribute('data-check');
    }
    registerInstanceToParent(scene, instance) {
        if (this.#parentElement) {
            this.#parentElement.registerInstance(scene, instance);
        }
    }
    init() {
        if (!this.formElement) {
            throw new Error('EmailAndPhoneModal: form element not found');
        }
        this.#editElements?.forEach((element) => {
            element.addEventListener('click', this.#onModalOpenHandler.bind(this));
        });
        this.addEventListener('modal:close', this.#onModalCloseHandler.bind(this));
        this.#nextButtonElement?.addEventListener('click', this.#onNextStepHandler.bind(this));
        this.formElement.addEventListener('submit', this.#onSubmitHandler.bind(this));
        if (this.#needCheckTag && this.#verifyCodeElements) {
            this.addEventListener('verifyCode:send', (event) => {
                const target = event.target;
                const step1Element = target.closest('.modify-modal__step1');
                const step2Element = target.closest('.modify-modal__step2');
                if (step1Element) {
                    this.#step1Send();
                }
                if (step2Element) {
                    this.#step2Send();
                }
            });
        }
    }
    #onModalOpenHandler() {
        this.#modalElement?.open();
        if (this.#needCheckTag && this.#verifyCodeElements) {
            this.#verifyCodeElements[0]?.send();
        }
    }
    #onModalCloseHandler() {
        this.#verifyCodeElements?.forEach((element) => {
            const { verifyCodeTimer } = element;
            verifyCodeTimer.stop();
        });
        this.#step1ContentElement?.classList.remove('hidden');
        this.#step2ContentElement?.classList.add('hidden');
        this.clearAllErrorMessage();
    }
    #step1Send() {
        if (!this.#verifyCodeElements) {
            throw new Error('EmailAndPhoneModal - step1Send: verifyCodeElements not found');
        }
        const { verifyCodeTimer } = this.#verifyCodeElements[0];
        if (!verifyCodeTimer.done())
            return;
        if (this.#step1DescElement) {
            this.#step1DescElement.innerHTML = '';
        }
        verifyCodeTimer.start();
        this.#accountInstance
            .sendVerifyCodeStep1()
            .then((response) => {
            const sendType = response.data.method;
            const sendTarget = sendType === 'sms_d' ? `+${response.data.mobileMask}` : response.data.emailMask;
            if (this.#step1DescElement) {
                this.#step1DescElement.innerHTML = window.Shopline.t('customer.general.verification_code_success', {
                    type: sendType === 'sms_d'
                        ? window.Shopline.t('customer.account.phone')
                        : window.Shopline.t('customer.account.email'),
                    value: sendTarget,
                });
            }
        })
            .catch((error) => {
            verifyCodeTimer.stop();
            this.updateErrorMessage({ error, insertBeforeElement: this.#step1ActionsElement });
        });
    }
    #onNextStepHandler(event) {
        event.preventDefault();
        if (!this.#nextButtonElement) {
            throw new Error('EmailAndPhoneModal - onNextStepHandler: nextButtonElement not found');
        }
        if (this.#nextButtonElement.classList.contains('loading'))
            return;
        this.#nextButtonElement.classList.add('loading');
        this.#accountInstance
            .nextStep()
            .then(() => {
            this.#step1ContentElement?.classList.add('hidden');
            this.#step2ContentElement?.classList.remove('hidden');
        })
            .catch((error) => {
            this.updateErrorMessage({ error, insertBeforeElement: this.#step1ActionsElement });
        })
            .finally(() => {
            this.#nextButtonElement?.classList.remove('loading');
        });
    }
    #step2Send() {
        if (!this.#verifyCodeElements) {
            throw new Error('EmailAndPhoneModal - step2Send: verifyCodeElements not found');
        }
        const { verifyCodeTimer } = this.#verifyCodeElements[1];
        if (!verifyCodeTimer.done())
            return;
        verifyCodeTimer.start();
        this.#accountInstance
            .sendVerifyCodeStep2()
            .then(() => { })
            .catch((error) => {
            verifyCodeTimer.stop();
            this.updateErrorMessage({ error, insertBeforeElement: this.#step2ActionsElement });
        });
    }
    #onSubmitHandler(event) {
        event.preventDefault();
        const submitButtonElement = this.formElement?.querySelector('button[type="submit"]');
        if (submitButtonElement.classList.contains('loading'))
            return;
        submitButtonElement.classList.add('loading');
        this.#accountInstance
            .submit()
            .then(() => {
            window.Shopline.utils.toast.open({
                content: window.Shopline.t('general.handle_success'),
                duration: 1000,
            });
            this.clearAllErrorMessage();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
            .catch((error) => {
            let insertBeforeElement = this.#step2ActionsElement;
            if (this.#defaultContentElement) {
                insertBeforeElement = this.#defaultActionsElement;
            }
            this.updateErrorMessage({ error, insertBeforeElement });
        })
            .finally(() => {
            submitButtonElement.classList.remove('loading');
        });
    }
}
