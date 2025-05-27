defineModule('theme-video-media', () => {
    class ThemeVideoMedia extends VisibleElement {
        static playVideoMedia(element) {
            element.play();
        }
        static playYoutubeMedia(element) {
            element.contentWindow?.postMessage(JSON.stringify({
                event: 'command',
                func: 'playVideo',
                args: '',
            }), '*');
        }
        static playVimeoMedia(element) {
            element.contentWindow?.postMessage(JSON.stringify({
                method: 'play',
            }), '*');
        }
        static pauseVideoMedia(element) {
            element.pause();
        }
        static pauseYoutubeMedia(element) {
            const message = JSON.stringify({
                func: 'pauseVideo',
                args: '',
                event: 'command',
            });
            element.contentWindow?.postMessage(message, '*');
        }
        static pauseVimeoMedia(element) {
            const message = JSON.stringify({
                method: 'pause',
            });
            element.contentWindow?.postMessage(message, '*');
        }
        static pauseAll() {
            document.querySelectorAll('video').forEach((videoElement) => {
                ThemeVideoMedia.pauseVideoMedia(videoElement);
            });
            document.querySelectorAll('iframe.video-media-youtube').forEach((iframeElement) => {
                ThemeVideoMedia.pauseYoutubeMedia(iframeElement);
            });
            document.querySelectorAll('iframe.video-media-vimeo').forEach((iframeElement) => {
                ThemeVideoMedia.pauseVimeoMedia(iframeElement);
            });
        }
        #playButton = null;
        #mediaElement = null;
        get loaded() {
            return this.getDatasetValue('loaded', 'boolean');
        }
        set loaded(force) {
            if (force) {
                this.dataset.loaded = 'true';
            }
            else {
                this.removeAttribute('data-loaded');
            }
        }
        constructor() {
            super();
            this.#playButton = this.querySelector('.theme-video-media__play-button');
            this.#mediaElement = this.querySelector('.theme-video-media__media');
            this.#playButton?.addEventListener('click', this.play.bind(this));
            this.#autoPlayHandler();
        }
        #autoPlayHandler() {
            const isAutoplay = this.getDatasetValue('autoplay', 'boolean');
            if (!isAutoplay) {
                return;
            }
            this.addEventListener('custom:visible', this.play.bind(this), { once: true });
        }
        load() {
            if (this.loaded) {
                return;
            }
            const templateElement = this.querySelector('template');
            if (!templateElement) {
                return;
            }
            this.querySelector('.theme-video-media__media')?.appendChild(templateElement.content);
            this.loaded = true;
        }
        play() {
            if (this.#playButton) {
                this.#playButton.style.display = 'none';
            }
            if (this.#mediaElement) {
                this.#mediaElement.classList.add("active");
            }
            if (!this.loaded) {
                this.load();
            }
            const videoElement = this.querySelector('video, iframe');
            if (videoElement) {
                videoElement.focus();
            }
            if (videoElement instanceof HTMLVideoElement) {
                ThemeVideoMedia.playVideoMedia(videoElement);
                return;
            }
            if (videoElement instanceof HTMLIFrameElement) {
                if (videoElement.classList.contains('video-media-youtube')) {
                    ThemeVideoMedia.playYoutubeMedia(videoElement);
                }
                else if (videoElement.classList.contains('video-media-vimeo')) {
                    ThemeVideoMedia.playVimeoMedia(videoElement);
                }
            }
        }
        pause() {
            const videoElement = this.querySelector('video, iframe');
            if (videoElement instanceof HTMLVideoElement) {
                ThemeVideoMedia.pauseVideoMedia(videoElement);
                return;
            }
            if (videoElement instanceof HTMLIFrameElement) {
                if (videoElement.classList.contains('video-media-youtube')) {
                    ThemeVideoMedia.pauseYoutubeMedia(videoElement);
                }
                else if (videoElement.classList.contains('video-media-vimeo')) {
                    ThemeVideoMedia.pauseVimeoMedia(videoElement);
                }
            }
        }
    }
    window.customElements.define('theme-video-media', ThemeVideoMedia);
    window.ThemeVideoMedia = ThemeVideoMedia;
});
