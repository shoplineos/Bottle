defineModule('theme-search-bar', () => {
    class HeaderSearchBar extends BaseElement {
        static SWITCH_NAME = '[data-role="search-bar-switch"]';
        static DISMISS_NAME = '[data-role="search-bar-dismiss"]';
        static INPUT_NAME = '[data-role="search-bar-input"]';
        static RESULT_NAME = '[data-role="search-bar-result"]';
        static RESULT_LIST_NAME = '[data-role="search-bar-result-list"]';
        static SEARCH_DEFAULT_OPTIONS = {
            field: 'title',
            resourceType: 'product',
            limit: '4',
            availableType: 'show',
            sectionId: 'predictive-search',
        };
        #switchClickHandler = (event) => {
            const targets = event.composedPath();
            if (!this.#isMatchingTarget(targets, HeaderSearchBar.SWITCH_NAME)) {
                return;
            }
            this.toggle();
        };
        #dismissClickHandler = (event) => {
            const targets = event.composedPath();
            if (!this.#isMatchingTarget(targets, HeaderSearchBar.DISMISS_NAME)) {
                return;
            }
            this.close();
        };
        #searchInputHandler = themeUtils.debounce((event) => {
            const target = event?.target;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }
            const keyword = target.value.trim();
            target.value = keyword;
            if (!keyword.length) {
                this.close();
                this.clear();
                return;
            }
            this.search(keyword);
        }, 300);
        mounted() {
            document.addEventListener('click', this.#switchClickHandler);
            this.addEventListener('click', this.#dismissClickHandler);
            this.addEventListener('input', this.#searchInputHandler);
            this.querySelector('form')?.addEventListener('submit', (event) => {
                event.preventDefault();
            });
        }
        unmounted() {
            document.removeEventListener('click', this.#switchClickHandler);
            this.removeEventListener('click', this.#dismissClickHandler);
            this.removeEventListener('input', this.#searchInputHandler);
        }
        #isMatchingTarget(targets, selector) {
            return targets.some((target) => {
                if (!(target instanceof HTMLElement)) {
                    return false;
                }
                return target.matches(selector);
            });
        }
        #lockScreen(force) {
            document.body.classList.toggle('header-search-bar--lockscreen', !!force);
        }
        #abortSearchController;
        async search(keyword, options = HeaderSearchBar.SEARCH_DEFAULT_OPTIONS) {
            const searchUrl = window.routes.predictiveSearchUrl;
            if (typeof searchUrl !== 'string') {
                throw new Error('Invalid search url');
            }
            const resultEl = this.querySelector(HeaderSearchBar.RESULT_NAME);
            if (!resultEl) {
                throw new Error(`Failed to find search result element: ${HeaderSearchBar.RESULT_NAME}`);
            }
            const listEl = this.querySelector(HeaderSearchBar.RESULT_LIST_NAME);
            if (!listEl) {
                throw new Error(`Failed to find search result element: ${HeaderSearchBar.RESULT_LIST_NAME}`);
            }
            const finalOptions = { ...HeaderSearchBar.SEARCH_DEFAULT_OPTIONS, ...options };
            const uri = new URL(searchUrl, window.location.origin);
            uri.searchParams.set('q', encodeURIComponent(keyword));
            uri.searchParams.set('field', finalOptions.field);
            uri.searchParams.set('resource_type', finalOptions.resourceType);
            uri.searchParams.set('limit', finalOptions.limit);
            uri.searchParams.set('available_type', finalOptions.availableType);
            uri.searchParams.set('section_id', finalOptions.sectionId);
            resultEl.classList.add('shown', 'loading');
            listEl.innerHTML = '';
            if (this.#abortSearchController) {
                this.#abortSearchController.abort();
            }
            const abort = new AbortController();
            this.#abortSearchController = abort;
            const response = await fetch(uri, {
                signal: abort.signal,
            });
            this.#abortSearchController = undefined;
            resultEl.classList.remove('loading');
            if (!response.ok) {
                throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            listEl.innerHTML = html.replace(/__QUERY_KEY__/g, themeUtils.sanitizeInput(keyword));
        }
        toggle(force) {
            if (this.classList.toggle('open', force)) {
                const input = this.querySelector('input');
                input.value = '';
                input.focus();
                const listEl = this.querySelector(HeaderSearchBar.RESULT_LIST_NAME);
                listEl.innerHTML = '';
                this.#lockScreen(true);
                return;
            }
            this.#lockScreen(false);
        }
        open() {
            this.toggle(true);
        }
        close() {
            this.toggle(false);
        }
        clear() { }
    }
    window.customElements.define('theme-search-bar', HeaderSearchBar);
});
