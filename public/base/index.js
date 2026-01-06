if (typeof window.Shopline === 'undefined') {
    window.Shopline = {};
}
const defineModule = (() => {
    const modules = new Map();
    return (name, definer) => {
        if (!modules.has(name)) {
            modules.set(name, definer);
            definer();
        }
    };
})();
;
var EnumThemeEvent;
(function (EnumThemeEvent) {
    EnumThemeEvent["ProductViewed"] = "product:viewed";
    EnumThemeEvent["VariantChanged"] = "variant:changed";
    EnumThemeEvent["VariantAdded"] = "variant:added";
    EnumThemeEvent["CartOpened"] = "cart:opened";
    EnumThemeEvent["CartClosed"] = "cart:closed";
    EnumThemeEvent["OpenCart"] = "cart:open";
    EnumThemeEvent["OpenQuickAddModal"] = "quick-add:open";
})(EnumThemeEvent || (EnumThemeEvent = {}));
themeEventCenter.addListener(EnumThemeEvent.OpenQuickAddModal, ({ detail }) => {
    window.Shopline.loadFeatures([
        {
            name: 'component-quick-add-modal',
            version: '0.1',
        },
    ], (error) => {
        if (error)
            throw error;
        window.Shopline.utils.quickAddModal.open(`/products/${detail.productHandle}`);
    });
});
;
const themeUtils = {
    throttle(fn, wait) {
        let timer = null;
        return (...args) => {
            if (timer) {
                return;
            }
            timer = window.setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, wait);
        };
    },
    debounce(fn, wait) {
        let timer = null;
        return (...args) => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = window.setTimeout(() => fn.apply(this, args), wait);
        };
    },
    jsonParse(str, normalValue) {
        try {
            const res = JSON.parse(str);
            return res;
        }
        catch {
            return normalValue;
        }
    },
    lockScroll() {
        document.body.style.overflow = 'hidden';
    },
    unlockScroll() {
        document.body.style.overflow = '';
    },
    changeURLArg(url, params) {
        const uri = new URL(url);
        Object.keys(params).forEach((arg) => {
            const val = params[arg];
            if (val) {
                uri.searchParams.set(arg, val);
            }
            else {
                uri.searchParams.delete(arg);
            }
        });
        return uri.toString();
    },
    isMobileScreen() {
        return window.matchMedia('(max-width: 959px)').matches;
    },
    addDoubleClickEventListener(target, listener) {
        let clicked = false;
        let timer = 0;
        return target.addEventListener('click', (event) => {
            clearTimeout(timer);
            if (clicked) {
                clicked = false;
                listener.call(this, event);
            }
            else {
                clicked = true;
                timer = setTimeout(() => {
                    clicked = false;
                }, 300);
            }
        });
    },
    fetchWithCache: (() => {
        const cacheMap = new Map();
        return (input, init) => {
            const targetUrl = input.toString();
            const fetchAction = fetch(input, init).then((res) => {
                cacheMap.set(targetUrl, res);
                setTimeout(() => cacheMap.delete(targetUrl), 30 * 1000);
                return res.clone();
            });
            const cacheResponse = cacheMap.get(targetUrl);
            return cacheResponse ? Promise.resolve(cacheResponse.clone()) : fetchAction;
        };
    })(),
    createDom(html) {
        const domParser = new DOMParser();
        const doms = domParser.parseFromString(html, 'text/html');
        return doms.body.firstElementChild;
    },
    execDomScript(dom) {
        const scripts = dom.querySelectorAll('script');
        scripts.forEach((script) => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach((attribute) => {
                newScript.setAttribute(attribute.name, attribute.value);
            });
            newScript.innerHTML = script.innerHTML;
            script?.replaceWith(newScript);
        });
    },
    generateUUID() {
        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
    },
    sanitizeInput(input) {
        const element = document.createElement('div');
        element.innerText = input;
        return element.innerHTML;
    },
    getQueryParams() {
        const searchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(Array.from(searchParams.entries()));
        return params;
    },
};
;
function detectingScreen(resizeHandleFn, isImmediate) {
    let isMobileScreen = themeUtils.isMobileScreen();
    let cleanUpResize;
    if (typeof resizeHandleFn !== 'function') {
        const destroy = Function.prototype;
        return { isMobileScreen, destroy };
    }
    const handleWindowResize = (event, isFirstTime = false) => {
        const isMobileScreenInResize = themeUtils.isMobileScreen();
        if (!(isMobileScreen !== isMobileScreenInResize || isFirstTime)) {
            return;
        }
        if (typeof cleanUpResize === 'function') {
            try {
                cleanUpResize({ isMobileScreen, event });
            }
            catch (err) {
                console.error('cleanUpResize call error', err);
            }
        }
        isMobileScreen = isMobileScreenInResize;
        cleanUpResize = resizeHandleFn({ isMobileScreen, event, first: isFirstTime });
    };
    const register = () => {
        window.addEventListener('resize', handleWindowResize);
        return function unregister() {
            window.removeEventListener('resize', handleWindowResize);
        };
    };
    if (isImmediate) {
        handleWindowResize(null, true);
    }
    const destroy = register();
    return { isMobileScreen, destroy };
}
;
class BaseElement extends HTMLElement {
    isMounted = false;
    mounted() { }
    unmounted() { }
    connectedCallback() {
        if (document.body.contains(this)) {
            this.mounted();
            this.isMounted = true;
        }
    }
    disconnectedCallback() {
        this.unmounted();
        this.isMounted = false;
    }
    getDatasetValue(name, type) {
        const originValue = this.dataset[name];
        switch (type) {
            case 'boolean': {
                if (originValue === '') {
                    return true;
                }
                return !!originValue && originValue !== 'false';
            }
            case 'string':
            default: {
                return originValue;
            }
        }
    }
    emit(type, detail, config) {
        const eventOptions = {
            bubbles: true,
            cancelable: true,
            ...config,
            detail,
        };
        const event = new CustomEvent(type, eventOptions);
        return this.dispatchEvent(event);
    }
    #bindMethodMap = new WeakMap();
    bind(method) {
        if (this.#bindMethodMap.has(method)) {
            return this.#bindMethodMap.get(method);
        }
        const result = method.bind(this);
        this.#bindMethodMap.set(method, result);
        return result;
    }
}
;
class VisibleElement extends BaseElement {
    visible = false;
    #visibleObserver;
    connectedCallback() {
        super.connectedCallback();
        this.#initVisibleObserver();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.#visibleObserver) {
            this.#visibleObserver.disconnect();
        }
    }
    #initVisibleObserver() {
        this.#visibleObserver = new IntersectionObserver((entryList) => {
            const entry = entryList[0];
            const prevVisible = this.visible;
            const currentVisible = entry.isIntersecting;
            if (prevVisible !== currentVisible) {
                this.emit(currentVisible ? 'custom:visible' : 'custom:hidden', undefined, {
                    bubbles: false,
                });
                this.classList[currentVisible ? 'add' : 'remove']('is-visible');
                this.visible = currentVisible;
            }
        }, {
            rootMargin: this.dataset.rootMargin || '100px',
            threshold: (this.dataset.threshold || '0').split(',').map(Number),
        });
        this.#visibleObserver.observe(this);
    }
}
;
class Cart extends BaseElement {
    static #CartChildInstanceList = [];
    static get inCartPage() {
        return document.body.dataset.pageType === 'cart';
    }
    static get cartAddType() {
        return document.body.dataset.cartAddType || '';
    }
    static init() {
        themeEventCenter.addListener(EnumThemeEvent.OpenCart, (event) => {
            const { refresh } = event.detail;
            const addedVariantDetail = themeEventCenter.getCurrentDetail(EnumThemeEvent.VariantAdded);
            const { lineItemKey = '' } = addedVariantDetail || {};
            const options = {
                refresh,
                lineItemKey,
            };
            this.#open(options);
        });
    }
    static registerInstance(instance) {
        this.#CartChildInstanceList.push(instance);
    }
    static #open(options = {}) {
        if (this.cartAddType === 'page' && !this.inCartPage && window.routes.cartUrl) {
            window.location.href = window.routes.cartUrl;
        }
        this.#show(options);
        if (options.refresh) {
            this.update(options);
        }
    }
    static async update(options = {}) {
        const newDocuments = await this.#getSectionsNewDocument();
        await this.#replaceElements(newDocuments, options);
        if (window.Shopline && window.Shopline.AdditionalButton) {
            window.Shopline.AdditionalButton.init();
        }
    }
    static #show(options = {}) {
        if (!this.#CartChildInstanceList.length) {
            window.location.href = window.routes.cartUrl;
        }
        this.#CartChildInstanceList.forEach((element) => element.open(options));
    }
    static async #getSectionsNewDocument() {
        const fetchUrl = new URL(window.routes.cartUrl, window.location.href);
        const renderSectionsName = (() => {
            const result = [];
            Object.entries(this.#CartChildInstanceList.map((item) => item.getRenderConfigs())).forEach(([, value]) => result.push(...value.map((item) => item.section)));
            return result.join(',');
        })();
        fetchUrl.searchParams.set('sections', renderSectionsName);
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error('fetch error');
        }
        const renderSections = (await response.json()) || {};
        if (Object.keys(renderSections).length === 0) {
            throw new Error('fetch sections render error');
        }
        return Object.keys(renderSections).reduce((acc, key) => {
            const domParser = new DOMParser();
            acc[key] = domParser.parseFromString(renderSections[key], 'text/html');
            return acc;
        }, {});
    }
    static async #replaceElements(newDocuments, options) {
        this.#CartChildInstanceList.forEach((sectionElement) => {
            sectionElement?.replaceElement(newDocuments, options);
        });
    }
    static replaceHTML(oldElementContainer, newElementContainer, selectors, reloadScript = false) {
        selectors.forEach((selector) => {
            const oldElement = oldElementContainer.querySelector(selector);
            const newElement = newElementContainer.querySelector(selector);
            if (!oldElement) {
                throw new Error(`oldElement not found: ${selector}`);
            }
            if (!newElement) {
                throw new Error(`newElement not found: ${selector}`);
            }
            oldElement.innerHTML = newElement.innerHTML;
            if (reloadScript) {
                themeUtils.execDomScript(oldElement);
            }
        });
    }
    static getSectionSelectors(sectionName, sectionConfig) {
        const targetSectionConfig = sectionConfig.filter((item) => item.section === sectionName);
        return targetSectionConfig.reduce((acc, item) => acc.concat(item.selectors), []);
    }
}
Cart.init();
;
class ShowMore extends BaseElement {
    #toggleButtonElement;
    constructor() {
        super();
        this.#toggleButtonElement = this.querySelector('button[name="toggle-more"]');
        this.#toggleButtonElement?.addEventListener('click', this.#toggleButtonClickHandler.bind(this));
    }
    get isOpen() {
        return this.hasAttribute('open') && this.getAttribute('open') !== 'false';
    }
    set isOpen(flag) {
        if (flag) {
            this.setAttribute('open', 'true');
        }
        else {
            this.removeAttribute('open');
        }
    }
    #toggleButtonClickHandler(event) {
        event.preventDefault();
        this.isOpen = !this.isOpen;
    }
}
customElements.define('theme-show-more', ShowMore);
;
(() => {
    const queryParams = themeUtils.getQueryParams();
    if (queryParams && queryParams.positioned_id) {
        const targetElement = document.getElementById(queryParams.positioned_id);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 0);
        }
    }
})();
;
