defineModule('theme-popover', () => {
    const MIN_GAP = 20;
    class Popover extends BaseElement {
        #isOpen = this.hasAttribute('open') && this.getAttribute('open') !== 'false';
        #animation;
        #contentElement;
        constructor() {
            super();
            const content = this.querySelector('theme-popover-content');
            if (!content) {
                throw new Error('[theme-popover] missing theme-popover-content tag!');
            }
            this.#contentElement = content;
            this.#animation = this.#createAnimation(content);
            this.#addTriggerEventListener();
        }
        get trigger() {
            return this.dataset.trigger ?? 'hover';
        }
        get position() {
            return this.dataset.position ?? 'top';
        }
        async open() {
            if (this.#isOpen) {
                return;
            }
            this.#isOpen = true;
            if (this.#animation.playState === 'running') {
                await this.#animation.finished;
            }
            this.#updateOpenState(true);
            this.#adaptationPosition();
            this.#animation.reverse();
        }
        async close() {
            if (!this.#isOpen) {
                return;
            }
            this.#isOpen = false;
            this.#animation.reverse();
            await this.#animation.finished;
            this.#updateOpenState(false);
            this.#updateContentStyle(this.position, { offsetX: 0, offsetY: 0 });
        }
        #addTriggerEventListener() {
            switch (this.trigger) {
                case 'click': {
                    this.addEventListener('click', (event) => {
                        const clickElement = event.target;
                        if (this.#contentElement.contains(clickElement) || this.#contentElement === clickElement) {
                            return;
                        }
                        if (this.#isOpen) {
                            this.close();
                        }
                        else {
                            this.open();
                        }
                    });
                    break;
                }
                case 'hover':
                default: {
                    let timer;
                    this.addEventListener('mouseenter', () => {
                        clearTimeout(timer);
                        this.open();
                    });
                    this.addEventListener('mouseleave', () => {
                        clearTimeout(timer);
                        timer = setTimeout(() => this.close(), 200);
                    });
                }
            }
        }
        #createAnimation(element) {
            const animations = [{ opacity: 1 }, { opacity: 0 }];
            const keyframes = new KeyframeEffect(element, animations, {
                iterations: 1,
                duration: 200,
                easing: 'ease',
                fill: 'both',
            });
            return new Animation(keyframes);
        }
        #updateOpenState(flag) {
            this.#isOpen = flag;
            if (flag) {
                this.setAttribute('open', 'true');
            }
            else {
                this.removeAttribute('open');
            }
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
            const { position } = this;
            const popoverReact = this.getBoundingClientRect();
            const viewport = this.#getViewportSize();
            let contentRect = this.#contentElement.getBoundingClientRect();
            const usableSpace = {
                top: popoverReact.top - MIN_GAP,
                bottom: viewport.height - popoverReact.bottom - MIN_GAP,
                left: popoverReact.left - MIN_GAP,
                right: viewport.width - popoverReact.right - MIN_GAP,
            };
            const enoughSpace = {
                left: usableSpace.left >= contentRect.width && usableSpace.top >= 0 && usableSpace.bottom >= 0,
                right: usableSpace.right >= contentRect.width && usableSpace.top >= 0 && usableSpace.bottom >= 0,
                top: usableSpace.top >= contentRect.height && usableSpace.left >= 0 && usableSpace.right >= 0,
                bottom: usableSpace.bottom >= contentRect.height && usableSpace.left >= 0 && usableSpace.right >= 0,
            };
            const adaptationPositionMap = {
                left: ['left', 'right', 'top', 'bottom'],
                right: ['right', 'left', 'top', 'bottom'],
                top: ['top', 'bottom', 'left', 'right'],
                bottom: ['bottom', 'top', 'left', 'right'],
            };
            const getOffsetDistance = (dir) => {
                const rangeKeyMap = {
                    horizontal: {
                        start: 'left',
                        end: 'right',
                    },
                    vertical: {
                        start: 'top',
                        end: 'bottom',
                    },
                };
                const { start, end } = rangeKeyMap[dir];
                const offsetStart = viewport[start] + MIN_GAP - contentRect[start];
                const offsetEnd = viewport[end] - MIN_GAP - contentRect[end];
                let offsetValue = 0;
                if (offsetStart > 0) {
                    offsetValue = offsetStart;
                }
                else if (offsetEnd < 0) {
                    offsetValue = offsetEnd;
                }
                return {
                    offsetX: dir === 'horizontal' ? offsetValue : 0,
                    offsetY: dir === 'vertical' ? offsetValue : 0,
                };
            };
            const positionOffsetDistance = {
                top: () => getOffsetDistance('horizontal'),
                bottom: () => getOffsetDistance('horizontal'),
                left: () => getOffsetDistance('vertical'),
                right: () => getOffsetDistance('vertical'),
            };
            const adaptationPosition = adaptationPositionMap[position]
                .map((pos) => ({
                position: pos,
                isEnoughSpace: enoughSpace[pos],
            }))
                .filter((item) => item.isEnoughSpace)[0]?.position ?? position;
            this.#updateContentStyle(adaptationPosition, {
                offsetX: 0,
                offsetY: 0,
            });
            contentRect = this.#contentElement.getBoundingClientRect();
            const offsetDistance = positionOffsetDistance[adaptationPosition]();
            this.#updateContentStyle(adaptationPosition, offsetDistance);
        }
        #updateContentStyle(position, offsetDistance) {
            if (position === this.position) {
                this.removeAttribute('data-adaptation-position');
            }
            else {
                this.dataset.adaptationPosition = position;
            }
            this.style.setProperty('--offset-x', `${offsetDistance.offsetX}px`);
            this.style.setProperty('--offset-y', `${offsetDistance.offsetY}px`);
        }
    }
    class PopoverContent extends HTMLElement {
    }
    customElements.define('theme-popover', Popover);
    customElements.define('theme-popover-content', PopoverContent);
});
