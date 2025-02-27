defineModule('theme-announcement-bar-sticky', () => {
    class ThemeAnnouncementBarSticky extends BaseElement {
        #announcementBarElement = null;
        get stickyMode() {
            return this.getDatasetValue('stickyMode', 'string');
        }
        constructor() {
            super();
            this.#announcementBarElement = document.querySelector('#shopline-section-sections--header-group__announcement-bar');
            if (!this.#announcementBarElement) {
                throw new Error('Announcement bar element not found');
            }
            if (this.stickyMode !== 'none') {
                window.addEventListener('scroll', this.#bindWindowScrollHandler.bind(this), false);
            }
            this.#announcementBarElement.classList.add(`announcement-bar__mode-${this.stickyMode}`);
        }
        #bindWindowScrollHandler() {
            const { scrollTop } = window.document.documentElement;
            if (scrollTop > 150) {
                window.requestAnimationFrame(themeUtils.throttle(() => this.#addSticky(), 100));
            }
            else {
                window.requestAnimationFrame(themeUtils.throttle(() => this.#removeSticky(), 100));
            }
        }
        #addSticky() {
            this.#announcementBarElement?.classList.add('announcement-bar__sticky');
        }
        #removeSticky() {
            this.#announcementBarElement?.classList.remove('announcement-bar__sticky');
        }
        disconnectedCallback() {
            if (this.stickyMode !== 'none') {
                window.addEventListener('scroll', this.#bindWindowScrollHandler, false);
            }
        }
    }
    window.customElements.define('theme-announcement-bar-sticky', ThemeAnnouncementBarSticky);
});
