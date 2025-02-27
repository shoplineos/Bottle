defineModule('theme-select', () => {
    class ThemeSelect extends BaseElement {
        #selectElement;
        #mockOptionListElement;
        constructor() {
            super();
            const select = this.querySelector('select');
            if (!select) {
                throw new Error('[theme-select]: child structure exception, missing select tag.');
            }
            this.#selectElement = select;
            this.#mockOptionListElement = this.appendChild(this.#createMockOptionList());
            this.#disabledNativeSelect();
            this.addEventListener('click', this.#clickHandler.bind(this));
            this.addEventListener('focusout', () => this.close());
            this.addEventListener('keyup', this.#keyupHandler.bind(this));
        }
        get value() {
            return this.#selectElement.value;
        }
        set value(val) {
            if (val === this.value) {
                return;
            }
            this.#selectElement.value = val;
            const eventOptions = { bubbles: true };
            const event = new Event('change', eventOptions);
            this.#selectElement.dispatchEvent(event);
            Array.from(this.options).forEach((option) => {
                if (option.getAttribute('value') === val) {
                    option.setAttribute('selected', 'true');
                }
                else {
                    option.removeAttribute('selected');
                }
            });
        }
        get options() {
            return this.#mockOptionListElement.getElementsByClassName('theme-select__option');
        }
        get isOpen() {
            return this.hasAttribute('open');
        }
        set isOpen(force) {
            if (force) {
                this.setAttribute('open', 'true');
            }
            else {
                this.removeAttribute('open');
            }
        }
        get #lockScroll() {
            return themeUtils.isMobileScreen();
        }
        async toggle() {
            if (this.isOpen) {
                return this.close();
            }
            return this.open();
        }
        async open() {
            if (this.isOpen) {
                return;
            }
            this.isOpen = true;
            if (this.#lockScroll) {
                themeUtils.lockScroll();
            }
            else if (this.dataset.position) {
                this.#mockOptionListElement.dataset.position = this.dataset.position;
            }
            else {
                this.#adaptationPosition();
            }
            await this.#doAnimate();
        }
        async close() {
            if (!this.isOpen) {
                return;
            }
            await this.#doAnimate(true);
            if (this.#lockScroll) {
                themeUtils.unlockScroll();
            }
            this.isOpen = false;
        }
        #disabledNativeSelect() {
            const select = this.#selectElement;
            select.style.pointerEvents = 'none';
            select.tabIndex = -1;
            this.tabIndex = 0;
        }
        #createMockOptionList() {
            const mainElement = themeUtils.createDom(`
      <div class="theme-select__main">
        <div class="theme-select__content modal-border-shadow">
          <div class="theme-select__list"></div>
        </div>
      </div>
    `);
            const listElement = mainElement.querySelector('.theme-select__list');
            Array.from(this.#selectElement.options).forEach((option) => {
                const mockOption = themeUtils.createDom(`
        <div class="theme-select__option">
          <svg class="icon theme-select__check-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5.5L4.5 9L11 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      `);
                Array.from(option.attributes).forEach((attr) => {
                    if (attr.name === 'class') {
                        return;
                    }
                    mockOption.attributes.setNamedItem(attr.cloneNode(true));
                });
                mockOption.classList.add('theme-select__option');
                const optionTemplate = option.querySelector('template');
                if (optionTemplate) {
                    mockOption.appendChild(optionTemplate.content);
                    optionTemplate.remove();
                }
                else {
                    const content = document.createElement('span');
                    content.innerHTML = option.innerHTML;
                    mockOption.appendChild(content);
                }
                listElement.appendChild(mockOption);
            });
            return mainElement;
        }
        #clickHandler(event) {
            const clickElement = event.target;
            const isClickTrigger = clickElement === this;
            if (isClickTrigger) {
                return this.toggle();
            }
            const clickOption = clickElement.closest('.theme-select__option');
            if (clickOption) {
                return this.#selectOption(clickOption);
            }
            const clickMask = clickElement.classList.contains('theme-select__main');
            if (clickMask) {
                return this.close();
            }
            return false;
        }
        #keyupHandler(event) {
            switch (event.code) {
                case 'Escape': {
                    this.close();
                    break;
                }
            }
        }
        #selectOption(option) {
            const isDisabled = option.hasAttribute('disabled');
            if (isDisabled) {
                return;
            }
            const value = option.getAttribute('value');
            if (value) {
                this.value = value;
            }
            this.close();
        }
        #doAnimate(isClose = false) {
            const contentElement = this.#mockOptionListElement.querySelector('.theme-select__content');
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
                    contentElement.style.animationName = `var(--select-animation-name, animation-fade-in-center)`;
                    contentElement.addEventListener('animationend', onAnimationend, { once: true });
                    timer = setTimeout(onAnimationend, 200);
                });
            });
        }
        #getViewportSize() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            return {
                width,
                height,
                left: 0,
                right: width,
                top: 0,
                bottom: height,
            };
        }
        #adaptationPosition() {
            const contentElement = this.#mockOptionListElement;
            const triggerRect = this.getBoundingClientRect();
            const viewport = this.#getViewportSize();
            const MIN_GAP = 10;
            const contentRect = contentElement.getBoundingClientRect();
            const usableSpace = {
                top: triggerRect.top - MIN_GAP,
                bottom: viewport.height - triggerRect.bottom - MIN_GAP,
            };
            const enoughSpace = {
                bottom: usableSpace.bottom >= contentRect.height,
                top: usableSpace.top >= contentRect.height,
            };
            const position = Object.entries(enoughSpace).find(([, isEnoughSpace]) => isEnoughSpace)?.[0] ?? 'bottom';
            contentElement.dataset.position = position;
        }
    }
    customElements.define('theme-select', ThemeSelect);
});
