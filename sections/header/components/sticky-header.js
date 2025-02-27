defineModule('theme-sticky-header', () => {
    class ThemeStickyHeader extends BaseElement {
        static STICKY_CLASS = 'theme-sticky-header--sticky';
        static STICKY_COLLAPSE_CLASS = 'theme-sticky-header--sticky-collapse';
        static BEFORE_STICKY_ELEMENTS = ['theme-announcement-bar-sticky'];
        #section = this.closest('.section');
        #lastScrollTop = 0;
        #visible = false;
        #observer = new IntersectionObserver(([entry]) => {
            this.#visible = entry.isIntersecting;
        });
        get #isSticky() {
            return this.#section.classList.contains(ThemeStickyHeader.STICKY_CLASS);
        }
        get #isCollapse() {
            return !this.#section.classList.contains(ThemeStickyHeader.STICKY_COLLAPSE_CLASS);
        }
        #toggleSticky(sticky = !this.#isSticky) {
            if (sticky) {
                const paddingTop = ThemeStickyHeader.BEFORE_STICKY_ELEMENTS.reduce((total, selector) => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((element) => {
                        const position = element.compareDocumentPosition(this.#section);
                        if (position === Node.DOCUMENT_POSITION_PRECEDING) {
                            return;
                        }
                        const rect = element.getBoundingClientRect();
                        total += rect.height;
                    });
                    return total;
                }, 0);
                this.style.setProperty('--theme-sticky-header-top', `${paddingTop}px`);
                this.#section.classList.add(ThemeStickyHeader.STICKY_CLASS);
                return;
            }
            this.#section.classList.remove(ThemeStickyHeader.STICKY_CLASS);
        }
        #toggleCollapse(isCollapse = !this.#isCollapse) {
            if (isCollapse) {
                this.#section.classList.add(ThemeStickyHeader.STICKY_COLLAPSE_CLASS);
                return;
            }
            this.#section.classList.remove(ThemeStickyHeader.STICKY_COLLAPSE_CLASS);
        }
        #stickyOnScrollUpHandler = () => {
            const { scrollTop } = document.documentElement;
            const lastScrollTop = this.#lastScrollTop || 0;
            this.#lastScrollTop = scrollTop;
            if (scrollTop === 0) {
                requestAnimationFrame(() => {
                    this.#toggleCollapse(false);
                    this.#toggleSticky(false);
                });
                return;
            }
            if (scrollTop < lastScrollTop) {
                requestAnimationFrame(() => {
                    this.#toggleCollapse(false);
                    if (!this.#visible) {
                        this.#toggleSticky(true);
                    }
                });
                return;
            }
            if (scrollTop > lastScrollTop) {
                if (this.#isSticky) {
                    requestAnimationFrame(() => this.#toggleCollapse(true));
                }
            }
        };
        #alwaysStickyHandler = () => {
            const { scrollTop } = document.documentElement;
            if (scrollTop === 0) {
                requestAnimationFrame(() => this.#toggleSticky(false));
                return;
            }
            if (!this.#visible) {
                requestAnimationFrame(() => this.#toggleSticky(true));
            }
        };
        mounted() {
            const mode = this.dataset.stickyMode;
            switch (mode) {
                case 'sticky_on_scroll_up':
                    window.addEventListener('scroll', this.#stickyOnScrollUpHandler, false);
                    break;
                case 'always_sticky':
                    window.addEventListener('scroll', this.#alwaysStickyHandler, false);
                    break;
                case 'none':
                default:
                    return;
            }
            this.#observer.observe(this);
        }
        unmounted() {
            this.#observer.unobserve(this);
            window.removeEventListener('scroll', this.#stickyOnScrollUpHandler, false);
            window.removeEventListener('scroll', this.#alwaysStickyHandler, false);
        }
    }
    customElements.define('theme-sticky-header', ThemeStickyHeader);
});
