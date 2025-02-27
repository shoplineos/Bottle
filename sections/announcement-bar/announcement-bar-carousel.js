defineModule('theme-announcement-bar-carousel', () => {
    class ThemeAnnouncementBarCarousel extends BaseElement {
        #themeCarouselElement = null;
        get arrows() {
            if (!this.#themeCarouselElement) {
                throw new Error('ThemeAnnouncementBarCarousel: Carousel element is not found');
            }
            return this.#themeCarouselElement.plugins.arrows;
        }
        constructor() {
            super();
            this.#themeCarouselElement = this.querySelector('theme-carousel');
            if (!this.#themeCarouselElement) {
                throw new Error('ThemeAnnouncementBarCarousel: Carousel element is not found');
            }
            this.#themeCarouselElement.addEventListener('carousel:render', () => {
                this.#init();
            }, { once: true });
            this.#themeCarouselElement.addEventListener('carousel:change', () => {
                if (this.arrows.controller.prev) {
                    this.#setButtonColorScheme();
                }
            });
        }
        #init() {
            if (!this.#themeCarouselElement) {
                throw new Error('ThemeAnnouncementBarCarousel: Carousel element is not found');
            }
            if (this.arrows.controller.prev) {
                this.#setButtonColorScheme();
            }
        }
        #setButtonColorScheme() {
            if (!this.#themeCarouselElement) {
                throw new Error('ThemeAnnouncementBarCarousel: Carousel element is not found');
            }
            if (!this.arrows.controller.prev) {
                throw new Error('ThemeAnnouncementBarCarousel: Carousel prev button is not found');
            }
            const { slides, currentIndex } = this.#themeCarouselElement;
            const { colorScheme } = slides[currentIndex].dataset;
            if (colorScheme) {
                const { prev, next } = this.arrows.controller;
                if (!prev || !next) {
                    return;
                }
                this.#removeClassStartswith(prev, 'color-scheme-');
                this.#removeClassStartswith(next, 'color-scheme-');
                prev.classList.add(colorScheme);
                next.classList.add(colorScheme);
            }
        }
        #removeClassStartswith(element, prefix) {
            const classes = element.classList;
            classes.forEach((item) => {
                if (item.startsWith(prefix)) {
                    classes.remove(item);
                }
            });
        }
    }
    window.customElements.define('theme-announcement-bar-carousel', ThemeAnnouncementBarCarousel);
});
