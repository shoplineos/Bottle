defineModule('theme-dropdown-menu', () => {
    class DropdownMenu extends BaseElement {
        static TRIGGER_NAME = '[data-role="dropdown-menu-trigger"]';
        static HIDE_NAME = '[data-hide]';
        #hideClickHandler = (event) => {
            const targets = event.composedPath();
            if (targets.includes(this)) {
                if (this.#isMatchingTarget(targets, DropdownMenu.HIDE_NAME)) {
                    this.hide();
                    return;
                }
                return;
            }
            this.hide();
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
            document.addEventListener('click', this.#hideClickHandler);
        }
        unmounted() {
            document.removeEventListener('click', this.#hideClickHandler);
        }
        hide() {
            const target = this.querySelector(DropdownMenu.TRIGGER_NAME);
            if (!target) {
                return;
            }
            target.checked = false;
        }
    }
    window.customElements.define('theme-dropdown-menu', DropdownMenu);
});
