defineModule('theme-footer-announcement-bar-sticky', () => {
    class ThemeFooterNavigation extends BaseElement {
        #navigationTitle = null;
        #navigationContent = null;
        constructor() {
            super();
            this.#navigationTitle = this.querySelector('.footer__navigation-title');
            this.#navigationContent = this.querySelector('.footer__navigation-content');
            if (!this.#navigationTitle) {
                throw new Error('ThemeFooterNavigation: navigationTitle is not found');
            }
            if (!this.#navigationContent) {
                throw new Error('ThemeFooterNavigation: navigationContent is not found');
            }
            this.#navigationTitle.addEventListener('click', () => this.#bindTitleClickHandler(), false);
        }
        #bindTitleClickHandler() {
            if (themeUtils.isMobileScreen()) {
                this.#menuToggle();
            }
        }
        #menuToggle() {
            const isClosed = this.getAttribute('open') == null;
            const doAnimate = () => {
                const animate = [
                    { height: 0, opacity: 0 },
                    {
                        height: `${this.#navigationContent?.getBoundingClientRect().height}px`,
                        opacity: 1,
                    },
                ];
                if (!isClosed) {
                    animate.reverse();
                }
                return this.#navigationContent?.animate(animate, {
                    iterations: 1,
                    duration: 200,
                    easing: 'ease',
                });
            };
            if (isClosed) {
                this.toggleAttribute('open');
                doAnimate();
            }
            else {
                const animate = doAnimate();
                if (animate) {
                    animate.onfinish = () => {
                        this.toggleAttribute('open');
                    };
                }
            }
        }
    }
    window.customElements.define('theme-footer-navigation', ThemeFooterNavigation);
});
