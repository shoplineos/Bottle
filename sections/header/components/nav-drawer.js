defineModule('theme-header-nav-drawer', () => {
    class HeaderNavDrawer extends BaseElement {
        static SWITCH_NAME = '[data-role="header-nav-drawer-switch"]';
        static DISMISS_NAME = '[data-role="header-nav-drawer-dismiss"]';
        static DEFAULT_ANIMTE_DURATION = 200;
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
        #show() {
            return new Promise((resolve) => {
                this.style.display = 'block';
                setTimeout(() => {
                    const isOpen = this.classList.toggle('open', true);
                    this.#lockScreen(isOpen);
                    resolve();
                }, HeaderNavDrawer.DEFAULT_ANIMTE_DURATION);
            });
        }
        #hide() {
            return new Promise((resolve) => {
                const isOpen = this.classList.toggle('open', false);
                this.#lockScreen(isOpen);
                setTimeout(() => {
                    this.style.display = 'none';
                    resolve();
                }, HeaderNavDrawer.DEFAULT_ANIMTE_DURATION);
            });
        }
        toggle(force) {
            const shouldShow = force || this.style.display !== 'block';
            return shouldShow ? this.#show() : this.#hide();
        }
        open() {
            return this.toggle(true);
        }
        close() {
            return this.toggle(false);
        }
    }
    window.customElements.define('theme-header-nav-drawer', HeaderNavDrawer);
});
