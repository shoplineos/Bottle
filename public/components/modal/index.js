defineModule('theme-modal', () => {
    const lockScrollModals = new Set();
    class Modal extends VisibleElement {
        container;
        originContainer;
        trigger;
        contentElement;
        constructor() {
            super();
            const container = this.querySelector('details');
            const trigger = container?.querySelector('summary');
            if (!container || !trigger) {
                throw new Error('[theme-modal]: child structure exception, missing details tag.');
            }
            this.container = container;
            this.originContainer = container;
            this.trigger = trigger;
            this.contentElement = this.trigger.nextElementSibling;
            this.trigger.addEventListener('click', this.bind(this.#triggerClickHandler));
            this.trigger.setAttribute('role', 'button');
            this.addEventListener('custom:visible', this.bind(this.#mountContainer), { once: true });
        }
        get isOpen() {
            return this.container.hasAttribute('open') ?? false;
        }
        set isOpen(flag) {
            const containers = [this.container, this.originContainer];
            if (flag) {
                containers.forEach((container) => container.setAttribute('open', 'true'));
            }
            else {
                containers.forEach((container) => container.removeAttribute('open'));
            }
        }
        get isDisabled() {
            return this.trigger.hasAttribute('disabled') ?? false;
        }
        set isDisabled(flag) {
            if (flag) {
                this.trigger.setAttribute('disabled', 'true');
            }
            else {
                this.trigger.removeAttribute('disabled');
            }
        }
        get #escToExit() {
            return this.getDatasetValue('escToExit', 'boolean');
        }
        get #maskClosable() {
            return this.getDatasetValue('maskClosable', 'boolean');
        }
        get #placement() {
            return this.dataset.placement ?? 'center';
        }
        async open() {
            if (this.isOpen || !this.emit('modal:open')) {
                return;
            }
            const { container } = this;
            this.isOpen = true;
            container.addEventListener('click', this.bind(this.#containerClickHandler));
            container.addEventListener('keyup', this.bind(this.#containerKeyupHandler));
            if (this.dataset.lockScroll !== 'false') {
                themeUtils.lockScroll();
                lockScrollModals.add(this);
            }
            this.#doAutoFocus();
            await this.#doAnimate();
        }
        async close() {
            if (!this.isOpen || !this.emit('modal:close')) {
                return;
            }
            await this.#doAnimate(true);
            this.isOpen = false;
            this.container.removeEventListener('click', this.bind(this.#containerClickHandler));
            this.container.removeEventListener('keyup', this.bind(this.#containerKeyupHandler));
            if (this.dataset.lockScroll !== 'false') {
                lockScrollModals.delete(this);
                if (lockScrollModals.size === 0) {
                    themeUtils.unlockScroll();
                }
            }
            this.trigger.focus();
        }
        disconnectedCallback() {
            const { container, originContainer } = this;
            if (container && originContainer && container !== originContainer) {
                container.parentNode?.removeChild(container);
            }
        }
        #mountContainer() {
            const { originContainer, trigger } = this;
            const popupContainerSelector = this.dataset.popupContainer;
            const popupContainer = popupContainerSelector ? document.querySelector(popupContainerSelector) : null;
            if (!popupContainer) {
                return;
            }
            const newContainer = originContainer.cloneNode(false);
            newContainer.dataset.mountModal = 'true';
            newContainer.dataset.placement = this.#placement;
            newContainer.appendChild(document.createElement('summary'));
            Array.from(originContainer.children).forEach((node) => {
                if (node !== trigger)
                    newContainer.appendChild(node);
            });
            popupContainer.appendChild(newContainer);
            this.container = newContainer;
        }
        #triggerClickHandler(event) {
            event.preventDefault();
            event.stopPropagation();
            if (this.isDisabled) {
                return;
            }
            if (this.isOpen) {
                this.close();
            }
            else {
                this.open();
            }
        }
        #containerClickHandler(event) {
            const clickElement = event.target;
            const isClickMask = clickElement === this.container;
            if (this.#maskClosable && isClickMask) {
                this.close();
            }
            const buttonElement = clickElement.closest('button');
            const isClickCloseButton = buttonElement &&
                buttonElement.getAttribute('name') === 'close' &&
                buttonElement?.closest('details') === this.container;
            if (isClickCloseButton) {
                this.close();
            }
        }
        #containerKeyupHandler(event) {
            const isEscKey = event.code === 'Escape';
            if (this.#escToExit && isEscKey) {
                this.close();
            }
        }
        #doAnimate(isClose = false) {
            const { contentElement } = this;
            if (!contentElement) {
                return Promise.resolve();
            }
            let timer;
            return new Promise((resolve) => {
                const onAnimationend = (event) => {
                    if (event && event.target !== contentElement) {
                        return;
                    }
                    contentElement.style.animationDirection = '';
                    contentElement.style.animationName = '';
                    clearTimeout(timer);
                    resolve(this);
                };
                requestAnimationFrame(() => {
                    if (isClose) {
                        contentElement.style.animationDirection = 'reverse';
                    }
                    contentElement.style.animationName = `var(--modal-animation-name, animation-fade-in-center)`;
                    contentElement.addEventListener('animationend', onAnimationend, { once: true });
                    timer = setTimeout(onAnimationend, 300);
                });
            });
        }
        #doAutoFocus() {
            const focusTarget = this.container.querySelector('input[autofocus]:not([type="hidden"])');
            if (focusTarget) {
                focusTarget.focus();
            }
        }
    }
    customElements.define('theme-modal', Modal);
    window.Modal = Modal;
});
