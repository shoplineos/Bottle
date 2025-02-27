defineModule('theme-collapse', () => {
    class Collapse extends BaseElement {
        constructor() {
            super();
            this.addEventListener('click', this.#onTriggerClick.bind(this));
        }
        get #rootContainer() {
            return this.querySelector('details');
        }
        async open(container = this.#rootContainer) {
            if (!container) {
                return;
            }
            const parentContainers = this.#getParentContainers(container);
            this.querySelectorAll('details').forEach((target) => !parentContainers.includes(target) && this.close(target));
            const template = container.querySelector('template');
            if (template) {
                container.appendChild(template.content);
                container.removeChild(template);
            }
            container.setAttribute('open', 'true');
            await this.#doAnimate(container);
        }
        async close(container = this.#rootContainer) {
            if (!container) {
                return;
            }
            await this.#doAnimate(container, true);
            container.removeAttribute('open');
        }
        #onTriggerClick(event) {
            const trigger = event.target.closest('summary');
            if (!trigger) {
                return;
            }
            const container = trigger.closest('details');
            if (!container) {
                return;
            }
            event.preventDefault();
            if (container.hasAttribute('open')) {
                this.close(container);
            }
            else {
                this.open(container);
            }
        }
        #getParentContainers(node) {
            const container = node.closest('details');
            if (!container) {
                return [];
            }
            if (container === this.#rootContainer || !container.parentElement) {
                return [container];
            }
            return [container, ...this.#getParentContainers(container.parentElement)];
        }
        #doAnimate(container, isClose = false) {
            const target = container.querySelector('summary')?.nextElementSibling;
            if (!target) {
                return Promise.resolve();
            }
            const animation = [
                { height: 0, opacity: 0 },
                {
                    height: `${target.getBoundingClientRect().height}px`,
                    opacity: 1,
                },
            ];
            if (isClose)
                animation.reverse();
            return new Promise((resolve) => {
                target
                    .animate(animation, {
                    iterations: 1,
                    duration: 200,
                    easing: 'ease',
                })
                    .addEventListener('finish', () => resolve(this));
            });
        }
    }
    customElements.define('theme-collapse', Collapse);
});
