defineModule('theme-product-media-preview', () => {
    const ZOOM_IN_CLASS = 'zoom-in';
    const IMAGE_SELECTOR = '.product-media-preview__image';
    class ProductMediaPreview extends Modal {
        mediaCarousel;
        mediaElements = [];
        #imageElements = [];
        constructor() {
            super();
            this.mediaCarousel = this.querySelector('theme-carousel');
            this.mediaElements = Array.from(this.querySelectorAll('.product-media-preview__media'));
            this.#imageElements = Array.from(this.querySelectorAll(IMAGE_SELECTOR));
            this.mediaCarousel.addEventListener('carousel:change', this.#carouselChangeHandler.bind(this));
            themeUtils.addDoubleClickEventListener(this.contentElement, this.#dblclickHandler.bind(this));
        }
        preview(mediaId) {
            const action = super.open();
            const targetMediaElement = this.mediaElements.find((ele) => ele.dataset.mediaId === mediaId);
            if (targetMediaElement) {
                const videoElement = targetMediaElement.querySelector('theme-video-media');
                if (videoElement) {
                    window.ThemeVideoMedia?.pauseAll();
                    videoElement.play();
                }
                requestAnimationFrame(() => {
                    targetMediaElement.classList.add('is-active');
                    targetMediaElement.scrollIntoView({ behavior: 'instant' });
                });
            }
            return action;
        }
        close() {
            window.ThemeVideoMedia?.pauseAll();
            return super.close();
        }
        #dblclickHandler(event) {
            if (!themeUtils.isMobileScreen()) {
                return;
            }
            const clickImageElement = event.target?.closest(IMAGE_SELECTOR);
            if (clickImageElement) {
                this.#toggleImageZoomIn(clickImageElement);
            }
        }
        #toggleImageZoomIn(imageElement, force) {
            const imageParentElement = imageElement.parentElement;
            const zoomIn = force ?? !imageParentElement.classList.contains(ZOOM_IN_CLASS);
            if (!zoomIn) {
                imageParentElement.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'instant',
                });
                imageParentElement.classList.remove(ZOOM_IN_CLASS);
            }
            else {
                const { scrollWidth, scrollHeight, clientWidth, clientHeight } = imageParentElement;
                imageParentElement.classList.add(ZOOM_IN_CLASS);
                imageParentElement.style.setProperty('--offset-x', `${Math.max(scrollWidth - clientWidth, 0)}px`);
                imageParentElement.style.setProperty('--offset-y', `${Math.max(scrollHeight - clientHeight, 0)}px`);
                imageParentElement.scrollTo({
                    left: Math.max((scrollWidth - clientWidth) / 2, 0),
                    top: Math.max((scrollHeight - clientHeight) / 2, 0),
                    behavior: 'instant',
                });
            }
        }
        #carouselChangeHandler(event) {
            if (!this.isOpen || !themeUtils.isMobileScreen()) {
                return;
            }
            const { currentIndex, currentSlide } = event.detail;
            this.#resetImageZoomIn();
            window.ThemeVideoMedia?.pauseAll();
            this.emit('product-media-preview:change', {
                index: currentIndex,
                mediaId: currentSlide.dataset.mediaId,
            });
        }
        #resetImageZoomIn() {
            this.#imageElements.forEach((img) => this.#toggleImageZoomIn(img, false));
        }
    }
    customElements.define('theme-product-media-preview', ProductMediaPreview);
});
