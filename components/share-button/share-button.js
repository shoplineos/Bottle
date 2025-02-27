defineModule('theme-share-button', () => {
    class ShareLink extends Modal {
        static observedAttributes = ['href'];
        href;
        #copyLinkElement;
        #copyButtonElement;
        #copySuccessButtonElement;
        constructor() {
            super();
            this.#copyLinkElement = this.querySelector('.share-button__href');
            this.#copyButtonElement = this.querySelector('.share-button__copy-button');
            this.#copySuccessButtonElement = this.querySelector('.share-button__copy-success-button');
            this.#copyButtonElement?.addEventListener('click', this.copyToClipboard.bind(this));
            this.#copySuccessButtonElement?.addEventListener('click', this.close.bind(this));
        }
        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'href': {
                    this.#updateHref(newValue);
                }
            }
        }
        async copyToClipboard() {
            const { href } = this;
            if (!href) {
                return;
            }
            await navigator.clipboard.writeText(href);
            if (this.#copyLinkElement) {
                this.#copyLinkElement.textContent = this.#copyLinkElement.dataset.successText;
            }
            if (this.#copySuccessButtonElement) {
                this.#copyButtonElement.classList.add('hidden');
                this.#copySuccessButtonElement.classList.remove('hidden');
            }
        }
        async open() {
            this.dataset.lockScroll = String(themeUtils.isMobileScreen());
            await super.open();
        }
        async close() {
            await super.close();
            if (this.#copySuccessButtonElement) {
                this.#copyButtonElement.classList.remove('hidden');
                this.#copySuccessButtonElement.classList.add('hidden');
                this.#updateHref();
            }
        }
        #updateHref(href = this.getAttribute('href')) {
            if (!href) {
                return;
            }
            if (this.#copyLinkElement) {
                this.#copyLinkElement.textContent = href;
            }
            this.href = href;
        }
    }
    customElements.define('theme-share-button', ShareLink);
});
