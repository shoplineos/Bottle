class OrderTracking extends BaseElement {
    #form;
    #accountErrorMessage;
    #orderErrorMessage;
    #orderTracking;
    #submitButton;
    #orderNumber;
    constructor() {
        super();
        this.#form = this.querySelector('form');
        this.#submitButton = this.querySelector('.main-order-tracking__submit');
        this.#accountErrorMessage = this.#form.querySelector('#account-error-message');
        this.#orderErrorMessage = this.#form.querySelector('#order-error-message');
        this.#orderNumber = this.#form.querySelector('#order_number_field');
        this.#submitButton.addEventListener('click', (event) => this.submitHandler(event));
        this.addTabsListener();
        this.loadSdk();
    }
    addTabsListener() {
        const tabs = this.querySelectorAll('.main-order-tracking__tabs > span');
        tabs?.forEach((tab) => {
            tab.addEventListener('click', (event) => {
                const target = event.target;
                tabs.forEach((t) => t.classList.remove('active'));
                target.classList.add('active');
                const type = target.getAttribute('data-type');
                const panes = this.querySelectorAll(`.main-order-tracking__panes > [data-type]`);
                panes.forEach((pane) => {
                    pane.querySelector('input')?.setAttribute('disabled', 'true');
                    pane.querySelector('select')?.setAttribute('disabled', 'true');
                    pane.classList.add('hidden');
                });
                const activePane = this.querySelector(`.main-order-tracking__panes > [data-type="${type}"]`);
                activePane.querySelector('input')?.removeAttribute('disabled');
                activePane.querySelector('select')?.removeAttribute('disabled');
                activePane.classList.remove('hidden');
                this.resetField();
            });
        });
    }
    loadSdk() {
        return new Promise((resolve) => {
            if (this.#orderTracking) {
                resolve(this.#orderTracking);
                return;
            }
            window.Shopline.loadFeatures([
                {
                    name: 'order-tracking-api',
                    version: '0.1',
                },
            ], (error) => {
                if (error) {
                    throw error;
                }
                this.#orderTracking = new window.Shopline.OrderTracking(this.#form);
                resolve(this.#orderTracking);
            });
        });
    }
    async submitHandler(event) {
        event.preventDefault();
        if (this.#submitButton.classList.contains('loading')) {
            return;
        }
        this.#submitButton.classList.add('loading');
        await this.loadSdk();
        try {
            const result = await this.#orderTracking.submit();
            if (result.data?.orderUrl) {
                window.location.href = result.data.orderUrl;
            }
        }
        catch (error) {
            this.handleSetErrorMsg(error);
        }
        finally {
            this.#submitButton.classList.remove('loading');
        }
    }
    handleSetErrorMsg(result) {
        const errorStrategy = {
            'order_tracking[email]': () => {
                this.#accountErrorMessage.innerHTML = result.msg;
                this.querySelector('[data-type="email"] .field')?.classList.add('field--error');
            },
            'order_tracking[phone]': () => {
                this.#accountErrorMessage.innerHTML = result.msg;
                this.querySelector('[data-type="phone"] .field')?.classList.add('field--error');
            },
        };
        const errorField = result.error_fields[0];
        const strategy = errorStrategy[errorField];
        if (strategy) {
            strategy();
            return;
        }
        this.#orderErrorMessage.innerHTML = result.msg;
        this.#orderNumber.classList.add('field--error');
    }
    resetField() {
        this.#accountErrorMessage.innerHTML = '';
        this.querySelector('[data-type="email"] .field')?.classList.remove('field--error');
        this.querySelector('[data-type="phone"] .field')?.classList.remove('field--error');
    }
}
window.customElements.define('theme-order-tracking', OrderTracking);
