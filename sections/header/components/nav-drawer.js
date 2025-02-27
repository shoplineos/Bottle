defineModule('theme-header-nav-drawer', () => {
    class HeaderNavDrawer extends BaseElement {
        static SWITCH_NAME = '[data-role="header-nav-drawer-switch"]';
        static DISMISS_NAME = '[data-role="header-nav-drawer-dismiss"]';
        #switchClickHandler = (event) => {
            const targets = event.composedPath();
            if (!this.#isMatchingTarget(targets, HeaderNavDrawer.SWITCH_NAME)) {
                return;
            }
            this.toggle();
        };
        #dismissClickHandler = (event) => {
            const targets = event.composedPath();
            if (!this.#isMatchingTarget(targets, HeaderNavDrawer.DISMISS_NAME)) {
                return;
            }
            this.close();
        };
        mounted() {
            document.addEventListener('click', this.#switchClickHandler);
            this.addEventListener('click', this.#dismissClickHandler);
        }
        unmounted() {
            document.removeEventListener('click', this.#switchClickHandler);
            this.removeEventListener('click', this.#dismissClickHandler);
        }
        #isMatchingTarget(targets, selector) {
            return targets.some((target) => {
                if (!(target instanceof HTMLElement)) {
                    return false;
                }
                return target.matches(selector);
            });
        }
        #lockScreen(force) {
            document.body.classList.toggle('header-nav-drawer--lockscreen', !!force);
        }
        toggle(force) {
            const isOpen = this.classList.toggle('open', force);
            this.#lockScreen(isOpen);
        }
        open() {
            this.toggle(true);
        }
        close() {
            this.toggle(false);
        }
    }
    window.customElements.define('theme-header-nav-drawer', HeaderNavDrawer);
});
