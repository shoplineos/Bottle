defineModule('theme-input-number', () => {
    class InputNumber extends BaseElement {
        #inputElement;
        #plusButtonElement;
        #minusButtonElement;
        constructor() {
            super();
            const input = this.querySelector('input[type="number"]');
            if (!input) {
                throw new Error('[theme-input-number]: child structure exception, missing input number tag.');
            }
            this.#inputElement = input;
            this.#plusButtonElement = this.querySelector('button[name="plus"]');
            this.#minusButtonElement = this.querySelector('button[name="minus"]');
            this.#plusButtonElement?.addEventListener('click', this.#stepButtonClickHandler.bind(this, true));
            this.#minusButtonElement?.addEventListener('click', this.#stepButtonClickHandler.bind(this, false));
            this.#inputElement.addEventListener('change', () => this.#updateView());
            this.#inputElement.addEventListener('blur', () => this.#fixInputValue());
            this.#updateView();
        }
        get value() {
            return Number(this.#inputElement.value);
        }
        set value(val) {
            const inputElement = this.#inputElement;
            const previousValue = inputElement.value;
            const newValue = String(this.#getRightValue(val));
            inputElement.value = newValue;
            if (newValue !== previousValue) {
                const eventOptions = { bubbles: true };
                const event = new Event('change', eventOptions);
                inputElement.dispatchEvent(event);
            }
        }
        get min() {
            return Number(this.#inputElement.min || Number.MIN_VALUE);
        }
        set min(val) {
            this.#inputElement.setAttribute('min', String(val));
        }
        get max() {
            return Number(this.#inputElement.max || Number.MAX_VALUE);
        }
        set max(val) {
            this.#inputElement.setAttribute('max', String(val));
        }
        get step() {
            return Number(this.#inputElement.step || 1);
        }
        set step(val) {
            this.#inputElement.setAttribute('step', String(val));
        }
        #updateView() {
            const { value, min, max } = this;
            if (this.#minusButtonElement) {
                this.#minusButtonElement.disabled = value <= min;
            }
            if (this.#plusButtonElement) {
                this.#plusButtonElement.disabled = value >= max;
            }
        }
        #getRightValue(val) {
            const { min, max } = this;
            if (val < min) {
                return min;
            }
            if (val > max) {
                return max;
            }
            return val;
        }
        #fixInputValue() {
            this.value = this.#getRightValue(this.value);
        }
        #stepButtonClickHandler(isPlus, event) {
            event.preventDefault();
            const { value, step } = this;
            this.value = isPlus ? value + step : value - step;
        }
    }
    customElements.define('theme-input-number', InputNumber);
});
