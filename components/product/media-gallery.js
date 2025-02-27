defineModule('theme-product-media-gallery', () => {
    class ProductMediaGallery extends VisibleElement {
        #mediaCarousel;
        #thumbnailCarousel;
        #stickyMediaWrapper;
        #mediaPreviewer;
        constructor() {
            super();
            this.#mediaCarousel = this.querySelector('.media-gallery__content');
            this.#thumbnailCarousel = this.querySelector('.media-gallery__thumbnails');
            this.#mediaPreviewer = this.querySelector('theme-product-media-preview');
            this.#stickyMediaWrapper = this.querySelector('.media-gallery__sticky-wrapper');
            this.#mediaCarousel.addEventListener('carousel:change', this.#mediaCarouselChangeHandler.bind(this));
            this.#mediaCarousel.addEventListener('click', this.#mediaCarouseClickHandler.bind(this));
            this.#thumbnailCarousel?.addEventListener('carousel:change', (event) => event.stopPropagation());
            this.#thumbnailCarousel?.addEventListener('click', this.#thumbnailCarouselClickHandler.bind(this));
            this.#mediaPreviewer?.addEventListener('product-media-preview:change', this.#mediaPreviewerChangeHandler.bind(this));
            this.addEventListener('custom:visible', () => {
                this.dataset.init = 'true';
            }, { capture: true, once: true });
        }
        get #disabledPreview() {
            return this.getDatasetValue('disabledPreview', 'boolean');
        }
        activeMedia(mediaId) {
            window.ThemeVideoMedia?.pauseAll();
            this.#selectThumbnail(mediaId);
            this.#selectMedia(mediaId);
            this.#updateCarouselHeight(mediaId);
            this.#stickyMedia(mediaId);
        }
        #mediaCarouselChangeHandler(event) {
            const { detail: { currentSlide }, } = event;
            const { mediaId } = currentSlide.dataset;
            if (!mediaId) {
                return;
            }
            this.#selectThumbnail(mediaId);
            this.#updateCarouselHeight(mediaId);
        }
        #mediaCarouseClickHandler(event) {
            const clickElement = event.target;
            const clickMedia = clickElement.closest('.media-gallery__item');
            const clickButton = clickElement.closest('button');
            const mediaId = clickMedia?.dataset.mediaId;
            if (!clickButton && clickMedia && mediaId && this.#mediaPreviewer && !this.#disabledPreview) {
                this.#mediaPreviewer.preview(mediaId);
            }
        }
        #thumbnailCarouselClickHandler(event) {
            const clickElement = event.target;
            const clickThumbnailElement = clickElement.closest('button.media-gallery__thumbnail');
            if (clickThumbnailElement) {
                const { mediaId } = clickThumbnailElement.dataset;
                if (!mediaId) {
                    return;
                }
                this.activeMedia(mediaId);
            }
        }
        #mediaPreviewerChangeHandler(event) {
            const { detail: { mediaId }, } = event;
            this.activeMedia(mediaId);
        }
        #selectThumbnail(mediaId) {
            if (!this.#thumbnailCarousel) {
                return;
            }
            this.#thumbnailCarousel.slides.forEach((thumbnail) => thumbnail.classList.toggle('is-select', thumbnail.dataset.mediaId === mediaId));
            const index = this.#thumbnailCarousel.slides.findIndex((slide) => slide.dataset.mediaId === mediaId);
            if (index != null && index >= 0) {
                this.#thumbnailCarousel.goToVisible(index);
            }
        }
        #selectMedia(mediaId) {
            const index = this.#mediaCarousel.slides.findIndex((slide) => slide.dataset.mediaId === mediaId);
            if (index >= 0) {
                this.#mediaCarousel.goToVisible(index);
            }
        }
        #updateCarouselHeight(mediaId) {
            if (themeUtils.isMobileScreen()) {
                return;
            }
            const mediaSlide = this.#mediaCarousel.slides.find((slide) => slide.dataset.mediaId === mediaId);
            this.#mediaCarousel.style.setProperty('--aspect-ratio', mediaSlide?.dataset.aspectRatio ?? '0.65');
        }
        #stickyMedia(mediaId) {
            if (!this.#stickyMediaWrapper) {
                return;
            }
            let mediaElement;
            this.#mediaCarousel.slides.forEach((slide) => {
                const isSelect = slide.dataset.mediaId === mediaId;
                slide.classList.toggle('is-select', isSelect);
                if (isSelect) {
                    mediaElement = slide;
                }
            });
            if (!mediaElement) {
                return;
            }
            this.#stickyMediaWrapper.firstElementChild?.replaceWith(mediaElement.cloneNode(true));
        }
    }
    customElements.define('theme-product-media-gallery', ProductMediaGallery);
});
