defineModule('theme-search-box', () => {
    class ThemeSearchBox extends VisibleElement {
        static INPUT_NAME = '[data-role="search-box-input"]';
        static CLEAR_NAME = '[data-role="search-box-clear"]';
        static RESULT_NAME = '[data-role="search-box-result"]';
        static RESULT_LIST_NAME = '[data-role="search-box-result-list"]';
        static SEARCH_DEFAULT_OPTIONS = {
            field: 'title',
            resourceType: 'product',
            limit: '4',
            availableType: 'show',
            sectionId: 'predictive-search',
        };
        mounted() {
            this.addEventListener('focusin', this.#showHandler);
            this.addEventListener('input', this.#searchHandler);
            this.addEventListener('click', this.#clearHandler);
            document.body.addEventListener('click', this.#hideHandler);
        }
        unmounted() {
            this.removeEventListener('focusin', this.#showHandler);
            this.removeEventListener('input', this.#searchHandler);
            this.removeEventListener('click', this.#clearHandler);
            document.body.removeEventListener('click', this.#hideHandler);
        }
        #searchHandler = themeUtils.debounce((event) => {
            const target = event?.target;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }
            const keyword = target.value.trim();
            target.value = keyword;
            if (!keyword.length) {
                return;
            }
            this.search(keyword);
        }, 300);
        #showHandler = (event) => {
            const targets = event.composedPath();
            if (!this.#isMatchingTarget(targets, ThemeSearchBox.INPUT_NAME)) {
                return;
            }
            if (this.isDirty() && !this.isEmpty() && this.isEmptyResult()) {
                this.#searchHandler(event);
                return;
            }
            if (this.isDirty() || this.isEmpty()) {
                return;
            }
            this.toggle(true);
        };
        #hideHandler = (event) => {
            const targets = event.composedPath();
            if (this.#isMatchingTarget(targets, this)) {
                return;
            }
            this.toggle(false);
        };
        #dismissHandler = (event) => {
            const targets = event.composedPath();
            if (!this.#isMatchingTarget(targets, this)) {
                return;
            }
            this.dismiss();
        };
        #clearHandler = (event) => {
            const target = event.composedPath();
            if (!this.#isMatchingTarget(target, ThemeSearchBox.CLEAR_NAME)) {
                return;
            }
            this.clear();
        };
        #abortSearchController;
        async search(keyword, options = ThemeSearchBox.SEARCH_DEFAULT_OPTIONS) {
            const searchUrl = window.routes.predictiveSearchUrl;
            if (typeof searchUrl !== 'string') {
                throw new Error('Invalid search url');
            }
            const resultEl = this.querySelector(ThemeSearchBox.RESULT_NAME);
            if (!resultEl) {
                throw new Error(`Failed to find search result element: ${ThemeSearchBox.RESULT_NAME}`);
            }
            const listEl = this.querySelector(ThemeSearchBox.RESULT_LIST_NAME);
            if (!listEl) {
                throw new Error(`Failed to find search result element: ${ThemeSearchBox.RESULT_LIST_NAME}`);
            }
            const finalOptions = { ...ThemeSearchBox.SEARCH_DEFAULT_OPTIONS, ...options };
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
            listEl.innerHTML = html.replace(/__QUERY_KEY__/g, keyword);
        }
        #isMatchingTarget(targets, selector) {
            return targets.some((target) => {
                if (!(target instanceof HTMLElement)) {
                    return false;
                }
                if (typeof selector === 'string') {
                    return target.matches(selector);
                }
                return target === selector;
            });
        }
        toggle(isOpen) {
            const resultEl = this.querySelector(ThemeSearchBox.RESULT_NAME);
            if (!resultEl) {
                throw new Error(`Failed to find search result element: ${ThemeSearchBox.RESULT_NAME}`);
            }
            if (isOpen) {
                resultEl.classList.add('shown');
                return;
            }
            resultEl.classList.remove('shown');
        }
        dismiss() {
            const resultEl = this.querySelector(ThemeSearchBox.RESULT_NAME);
            if (!resultEl) {
                throw new Error(`Failed to find search result element: ${ThemeSearchBox.RESULT_NAME}`);
            }
            resultEl.classList.remove('shown');
        }
        clear() {
            const inputEl = this.querySelector(ThemeSearchBox.INPUT_NAME);
            if (!inputEl) {
                throw new Error(`Failed to find search input element: ${ThemeSearchBox.INPUT_NAME}`);
            }
            inputEl.value = '';
            this.dismiss();
        }
        isDirty() {
            const inputEl = this.querySelector(ThemeSearchBox.INPUT_NAME);
            if (!inputEl) {
                throw new Error(`Failed to find search input element: ${ThemeSearchBox.INPUT_NAME}`);
            }
            const uri = new URL(window.location.href);
            const keyword = uri.searchParams.get('keyword') || '';
            return inputEl.value === keyword;
        }
        isEmpty() {
            const inputEl = this.querySelector(ThemeSearchBox.INPUT_NAME);
            if (!inputEl) {
                throw new Error(`Failed to find search input element: ${ThemeSearchBox.INPUT_NAME}`);
            }
            return inputEl.value === '';
        }
        isEmptyResult() {
            const listEl = this.querySelector(ThemeSearchBox.RESULT_LIST_NAME);
            if (!listEl) {
                throw new Error(`Failed to find search result list element: ${ThemeSearchBox.RESULT_LIST_NAME}`);
            }
            return listEl.children.length === 0;
        }
    }
    customElements.define('theme-search-box', ThemeSearchBox);
});
