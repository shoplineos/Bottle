defineModule('theme-nav-bar', () => {
    class NavBar extends BaseElement {
        static #MENU_SELECTOR = '[data-role="menu"]';
        static #NAV_SELECTOR = '[data-role="header-nav"]';
        #openMenu(element) {
            this.#closeAllMenu();
            element.classList.add('open');
        }
        #closeAllMenu() {
            document.querySelectorAll(NavBar.#MENU_SELECTOR).forEach((item) => {
                item.classList.remove('open');
            });
        }
        #openDropdownMenuHandler = (event) => {
            const target = event.target;
            const menu = target.closest(NavBar.#MENU_SELECTOR);
            if (!menu) {
                return;
            }
            this.#openMenu(menu);
        };
        #closeDropdownMenuHandler = (event) => {
            const targets = event.composedPath();
            if (this.#isMatchingTarget(targets, NavBar.#NAV_SELECTOR)) {
                return;
            }
            this.#closeAllMenu();
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
            this.addEventListener('click', this.#openDropdownMenuHandler);
            document.addEventListener('click', this.#closeDropdownMenuHandler);
        }
        unmounted() {
            this.removeEventListener('click', this.#openDropdownMenuHandler);
            document.removeEventListener('click', this.#closeDropdownMenuHandler);
        }
    }
    window.customElements.define('theme-nav-bar', NavBar);
});
