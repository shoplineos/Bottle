defineModule('theme-locale-picker', () => {
    class LocalePicker extends BaseElement {
        static LANGUAGE_FIELD_NAME = 'input[name="locale_code"]';
        static COUNTRY_FIELD_NAME = 'input[name="country_code"]';
        #formChangedHandler = (event) => {
            const targets = event.composedPath();
            const target = event.target;
            if (!target || target.type !== 'radio') {
                return;
            }
            if (this.#isMatchingTarget(targets, LocalePicker.LANGUAGE_FIELD_NAME)) {
                event.preventDefault();
                this.submit();
                return;
            }
            if (this.#isMatchingTarget(targets, LocalePicker.COUNTRY_FIELD_NAME)) {
                event.preventDefault();
                this.submit();
            }
        };
        #isMatchingTarget(targets, selector) {
            return targets.some((target) => {
                if (!(target instanceof HTMLElement)) {
                    return false;
                }
                return target.matches(selector);
            });
        }
        mounted() {
            this.addEventListener('change', this.#formChangedHandler);
        }
        unmounted() {
            this.removeEventListener('change', this.#formChangedHandler);
        }
        submit() {
            const form = this.querySelector('form');
            if (!form) {
                return;
            }
            form.submit();
        }
    }
    window.customElements.define('theme-locale-picker', LocalePicker);
});
