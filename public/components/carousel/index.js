defineModule('theme-carousel', () => {
    const ACTIVE_CLASS = 'is-active';
    const TRACK_CLASS = 'carousel__track';
    class CarouselPlugin {
        carousel;
        #bindMethodMap = new WeakMap();
        constructor(carousel) {
            this.carousel = carousel;
            if (this.render) {
                carousel.addEventListener('carousel:internal:render', this.render.bind(this));
            }
            if (this.update) {
                carousel.addEventListener('carousel:change', this.update.bind(this));
            }
        }
        render() { }
        update() { }
        bind(method) {
            if (this.#bindMethodMap.has(method))
                return this.#bindMethodMap.get(method);
            const result = method.bind(this);
            this.#bindMethodMap.set(method, result);
            return result;
        }
    }
    class CarouselPaginationPlugin extends CarouselPlugin {
        pagers = [];
        indicators = {
            current: null,
            total: null,
        };
        render() {
            const { carousel } = this;
            this.indicators.current = carousel.querySelector('span[name="current"]');
            this.indicators.total = carousel.querySelector('span[name="total"]');
            this.pagers = Array.from(carousel.querySelectorAll('button[name="pager"]'));
            this.pagers.forEach((pager) => pager.addEventListener('click', this.bind(this.#pagerClickHandler)));
            this.update();
        }
        update() {
            const { pagers, carousel, indicators } = this;
            pagers.forEach((pager) => {
                const activated = String(carousel.currentIndex) === pager.dataset.index;
                pager.classList[activated ? 'add' : 'remove'](ACTIVE_CLASS);
            });
            if (indicators.current) {
                indicators.current.textContent = String(carousel.currentIndex + 1);
            }
            if (indicators.total) {
                indicators.total.textContent = String(carousel.totalPage);
            }
        }
        #pagerClickHandler(event) {
            const pager = event.currentTarget;
            const index = Number(pager.dataset.index);
            if (!Number.isNaN(index)) {
                event.preventDefault();
                this.carousel.goTo(index);
            }
        }
    }
    class CarouselAutoplayPlugin extends CarouselPlugin {
        #playTimer;
        get enable() {
            return this.carousel.dataset.autoplay === 'true';
        }
        get speed() {
            return Number(this.carousel.dataset.autoplaySpeed || 8) * 1000;
        }
        get isLastPage() {
            const { carousel } = this;
            return carousel.loop ? false : carousel.currentIndex === carousel.totalPage - 1;
        }
        render() {
            this.update();
        }
        update() {
            if (this.enable) {
                this.play();
            }
        }
        play() {
            if (this.isLastPage)
                return;
            const { carousel } = this;
            clearTimeout(this.#playTimer);
            this.#playTimer = setTimeout(() => carousel.goTo((carousel.currentIndex + 1) % carousel.totalPage), this.speed);
        }
        pause() {
            clearTimeout(this.#playTimer);
        }
    }
    class CarouselArrowsPlugin extends CarouselPlugin {
        controller = {
            prev: null,
            next: null,
        };
        handlers = {};
        render() {
            const { carousel, controller, handlers } = this;
            controller.prev = carousel.querySelector('button[name="previous"]');
            controller.next = carousel.querySelector('button[name="next"]');
            if (controller.prev) {
                handlers.previous = handlers.previous || this.#controllerClickHandler.bind(this, false);
                controller.prev.addEventListener('click', handlers.previous);
            }
            if (controller.next) {
                handlers.next = handlers.next || this.#controllerClickHandler.bind(this, true);
                controller.next.addEventListener('click', handlers.next);
            }
            this.update();
        }
        update() {
            const { carousel, controller } = this;
            if (carousel.loop) {
                return;
            }
            this.#disableController(controller.prev, carousel.currentIndex === 0);
            this.#disableController(controller.next, carousel.currentIndex + 1 === carousel.totalPage);
        }
        #controllerClickHandler(direction, event) {
            event.preventDefault();
            const { carousel } = this;
            const { currentIndex, totalPage, loop } = carousel;
            const targetButton = event.currentTarget;
            const step = Number(targetButton.dataset.step || 1) * (direction ? 1 : -1);
            const maxIndex = totalPage - 1;
            const minIndex = 0;
            const limitRange = !loop || (currentIndex !== minIndex && currentIndex !== maxIndex);
            const targetIndex = limitRange
                ? Math.min(Math.max(carousel.currentIndex + step, minIndex), maxIndex)
                : carousel.currentIndex + step;
            const realityTargetIndex = (targetIndex + carousel.totalPage) % carousel.totalPage;
            carousel.goTo(realityTargetIndex);
        }
        #disableController(controller, disabled) {
            if (!controller) {
                return;
            }
            if (disabled) {
                controller.setAttribute('disabled', 'disabled');
            }
            else {
                controller.removeAttribute('disabled');
            }
        }
    }
    class Carousel extends VisibleElement {
        track;
        slides = [];
        currentIndex = 0;
        totalPage = 0;
        plugins;
        #resizeObserver;
        get loop() {
            return this.getDatasetValue('loop', 'boolean');
        }
        get restorePosition() {
            return this.getDatasetValue('restorePosition', 'boolean');
        }
        get direction() {
            return this.dataset.direction === 'vertical' ? 'vertical' : 'horizontal';
        }
        constructor() {
            super();
            this.track = this.querySelector(`.${TRACK_CLASS}`);
            if (!this.track) {
                throw new Error('[theme-carousel]: carousel track does not exist!');
            }
            this.plugins = {
                autoplay: new CarouselAutoplayPlugin(this),
                arrows: new CarouselArrowsPlugin(this),
                pagination: new CarouselPaginationPlugin(this),
            };
            this.addEventListener('custom:visible', () => {
                this.#init();
                const resizeHandler = themeUtils.throttle(this.bind(this.#init), 100);
                this.#resizeObserver = new ResizeObserver(resizeHandler);
                this.#resizeObserver.observe(this.track);
                const scrollHandler = themeUtils.throttle(this.bind(this.#slideUpdate), 100);
                this.track.addEventListener('scroll', scrollHandler);
            }, { once: true });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.#resizeObserver) {
                this.#resizeObserver.disconnect();
            }
        }
        goTo(index, force) {
            if (index === this.currentIndex && !force)
                return;
            const targetSlide = this.slides[index];
            if (targetSlide) {
                this.track.scrollTo(this.direction === 'vertical' ? { top: targetSlide.offsetTop } : { left: targetSlide.offsetLeft });
            }
        }
        goToVisible(index) {
            const { track, slides } = this;
            const targetSlide = slides[index];
            if (targetSlide) {
                const trackSizes = this.#getElementSizes(track);
                const isVisible = this.#isVisibleSlide(trackSizes, targetSlide);
                if (!isVisible) {
                    this.goTo(index);
                }
            }
        }
        reset() {
            this.#init();
        }
        #init() {
            this.slides = Array.from(this.track.children);
            this.currentIndex = this.#getInitIndex();
            this.totalPage = this.#getTotalPage();
            if (this.restorePosition) {
                this.goTo(this.currentIndex, true);
            }
            this.addEventListener('carousel:change', this.bind(this.#updateView));
            this.emit('carousel:internal:render', undefined, {
                bubbles: false,
            });
            this.emit('carousel:render', undefined, {
                bubbles: false,
            });
        }
        #updateView() {
            this.slides.forEach((slide, index) => slide.classList.toggle(ACTIVE_CLASS, index === this.currentIndex));
        }
        #slideUpdate() {
            const { totalPage, currentIndex: previousIndex, track, slides } = this;
            const trackSizes = this.#getElementSizes(track);
            const activeIndex = slides.findIndex((slide) => this.#isVisibleSlide(trackSizes, slide));
            if (activeIndex < 0 || activeIndex >= totalPage) {
                return;
            }
            const activeSlide = slides[activeIndex];
            if (previousIndex !== activeIndex) {
                this.currentIndex = activeIndex;
                this.#updateView();
                this.emit('carousel:change', {
                    currentIndex: activeIndex,
                    currentSlide: activeSlide,
                }, {
                    bubbles: false,
                });
            }
        }
        #isVisibleSlide(trackSizes, slide) {
            const slideSizes = this.#getElementSizes(slide);
            const isAfterTrackLeft = slideSizes.offsetStart - trackSizes.scrollStart >= -1;
            const isBeforeTrackRight = trackSizes.scrollStart + trackSizes.clientSize - (slideSizes.offsetStart + slideSizes.clientSize) >= -1;
            return slideSizes.clientSize > 0 && isAfterTrackLeft && isBeforeTrackRight;
        }
        #getElementSizes(element) {
            if (this.direction === 'vertical') {
                return {
                    clientSize: element.clientHeight,
                    scrollSize: element.scrollHeight,
                    scrollStart: element.scrollTop,
                    offsetStart: element.offsetTop,
                };
            }
            return {
                clientSize: element.clientWidth,
                scrollSize: element.scrollWidth,
                scrollStart: element.scrollLeft,
                offsetStart: element.offsetLeft,
            };
        }
        #getInitIndex() {
            const index = this.slides.findIndex((slide) => slide.classList.contains(ACTIVE_CLASS));
            return index < 0 ? 0 : index;
        }
        #getTotalPage() {
            const { track, slides } = this;
            if (slides.length <= 1) {
                return slides.length;
            }
            const trackSizes = this.#getElementSizes(track);
            let slideWithInScreenNum = 1;
            for (let i = slides.length - 2; i >= 0; i -= 1) {
                const slide = slides[i];
                const slideSizes = this.#getElementSizes(slide);
                if (trackSizes.scrollSize - slideSizes.offsetStart < trackSizes.clientSize + 1) {
                    slideWithInScreenNum += 1;
                }
                else {
                    break;
                }
            }
            return slides.length - slideWithInScreenNum + 1;
        }
    }
    customElements.define('theme-carousel', Carousel);
});
