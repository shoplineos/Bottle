defineModule('theme-facets', () => {
    class PriceRange extends HTMLElement {
        #minInputElement;
        #maxInputElement;
        constructor() {
            super();
            this.addEventListener('input', (event) => {
                event.stopPropagation();
            });
            const inputElements = this.querySelectorAll('input');
            const [minInputElement, maxInputElement] = Array.from(inputElements);
            this.#minInputElement = minInputElement;
            this.#maxInputElement = maxInputElement;
            this.#minInputElement.addEventListener('input', (event) => {
                const target = event.target;
                const currentMinValue = Number(target.value);
                const max = Number(target.max);
                if (currentMinValue > max) {
                    target.value = max.toString();
                }
            });
            this.#maxInputElement.addEventListener('input', (event) => {
                const target = event.target;
                const currentMaxValue = Number(target.value);
                const max = Number(target.max);
                if (currentMaxValue > max) {
                    target.value = max.toString();
                }
            });
        }
        isFullRange() {
            const minValue = this.#minInputElement.value;
            const maxValue = this.#maxInputElement.value;
            const transformMaxValue = this.#maxInputElement.max;
            return Number(minValue) === 0 && Number(maxValue) === Number(transformMaxValue);
        }
    }
    window.customElements.define('theme-price-range', PriceRange);
    const cacheData = [];
    const urlSearchParamsInitial = window.location.search.slice(1);
    let urlSearchParamsPrev = urlSearchParamsInitial;
    class FacetsForm extends HTMLElement {
        #formElement;
        #listContainerElement;
        #loadingElement;
        #loading = false;
        constructor() {
            super();
            this.#listContainerElement = document.querySelector('#ResultsContainer');
            this.#loadingElement = document.querySelector('.facets-loading-wrapper');
            this.#formElement = this.querySelector('form');
            this.addListeners();
        }
        addListeners() {
            const debounceSummitHandler = themeUtils.debounce((event) => {
                this.submitHandler(event);
            }, 500);
            this.#formElement.addEventListener('input', (event) => {
                const target = event.target;
                if (target.name !== 'sort_by' && (target.closest('.facets-layout-drawer') || target.closest('.facets-mobile'))) {
                    return;
                }
                debounceSummitHandler(event);
            });
            this.querySelectorAll('[name="confirm"]')?.forEach((confirm) => {
                confirm.addEventListener('click', (event) => {
                    this.querySelectorAll('theme-modal').forEach((modal) => {
                        modal.close();
                    });
                    debounceSummitHandler(event);
                });
            });
            this.addEventListener('history:pushState', () => this.urlChangeHandler());
            const onHistoryChange = (event) => {
                let searchParams = urlSearchParamsInitial;
                if (event.state) {
                    searchParams = event.state.searchParams;
                }
                if (searchParams === urlSearchParamsPrev) {
                    return;
                }
                this.updateUrl(searchParams);
            };
            window.addEventListener('popstate', onHistoryChange);
            this.addEventListener('modal:open', (event) => this.multiThemeModalToggleHandler(event));
            document.body.addEventListener('click', (event) => this.multiThemeModalToggleHandler(event));
        }
        multiThemeModalToggleHandler(event) {
            [
                ...Array.from(this.querySelectorAll('.facets-layout-horizontal .facets-filtering__details')),
                ...Array.from(this.querySelectorAll('.facets-sorting__details')),
            ].forEach((details) => {
                if (!details.contains(event.target)) {
                    details.removeAttribute('open');
                }
            });
        }
        async urlChangeHandler() {
            if (this.#loading) {
                return;
            }
            this.#loadingElement.classList.add('loading');
            this.#loading = true;
            const searchParams = new URL(window.location.href).searchParams.toString();
            urlSearchParamsPrev = searchParams;
            const url = `${window.location.pathname}?section_id=${this.getAttribute('data-section-id')}&${searchParams}`;
            const cache = cacheData.find((element) => element.url === url);
            try {
                let html = '';
                if (cache) {
                    html = cache.html;
                }
                else {
                    const response = await fetch(url);
                    html = await response.text();
                    cacheData.push({ url, html });
                }
                this.updateFacets(html);
                this.updateResults(html);
            }
            finally {
                this.#loadingElement.classList.remove('loading');
                this.#loading = false;
            }
        }
        updateFacets(html) {
            const domParser = new DOMParser();
            const parsedHTML = domParser.parseFromString(html, 'text/html');
            const jsActionSelector = `theme-facets-form .js-action`;
            const jsActionCurrent = Array.from(document.querySelectorAll(jsActionSelector)).map((facetsFormElement) => facetsFormElement);
            const jsActionResults = Array.from(parsedHTML.querySelectorAll(jsActionSelector)).map((facetsFormElement) => facetsFormElement);
            for (let i = 0; i < jsActionCurrent.length; i++) {
                const resultHTML = jsActionResults[i].outerHTML;
                if (resultHTML) {
                    jsActionCurrent[i].outerHTML = jsActionResults[i].outerHTML;
                }
            }
        }
        updateResults(html) {
            const domParser = new DOMParser();
            const parsedHTML = domParser.parseFromString(html, 'text/html');
            const resultsContainerElement = parsedHTML.querySelector('#ResultsContainer');
            this.#listContainerElement.innerHTML = resultsContainerElement.innerHTML;
        }
        submitHandler(event) {
            event.preventDefault();
            const searchParams = this.createFacetsFormSearchParams();
            this.updateUrl(searchParams);
        }
        updateUrl(searchParams) {
            window.history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && `?${searchParams}`}`);
            const customEvent = new CustomEvent('history:pushState', { detail: { searchParams } });
            this.dispatchEvent(customEvent);
        }
        getPreviewQuerySearch() {
            const currentUrlWithoutFacets = new URLSearchParams(window.location.search);
            Array.from(currentUrlWithoutFacets.keys()).forEach((key) => {
                if (key.startsWith('filter') || key.startsWith('sort_by') || key === 'page_num') {
                    currentUrlWithoutFacets.delete(key);
                }
            });
            return currentUrlWithoutFacets;
        }
        createFacetsFormSearchParams(urlSearchParams) {
            const formData = new FormData(this.#formElement);
            const facetsUrlSearchParams = new URLSearchParams(formData);
            const facetsFormSearchParams = urlSearchParams ?? facetsUrlSearchParams;
            const previewQuerySearchParams = this.getPreviewQuerySearch();
            let mergedParams = new URLSearchParams([
                ...previewQuerySearchParams.entries(),
                ...facetsFormSearchParams.entries(),
            ]);
            if (urlSearchParams) {
                mergedParams = new URLSearchParams(Object.fromEntries(mergedParams));
            }
            const priceRange = this.#formElement.querySelector('theme-price-range');
            const shouldDeletePrice = priceRange?.isFullRange();
            if (shouldDeletePrice) {
                mergedParams.delete('filter.v.price.gte');
                mergedParams.delete('filter.v.price.lte');
            }
            return mergedParams.toString();
        }
        removeFilter(event) {
            event.preventDefault();
            const target = event.currentTarget;
            const href = target.getAttribute('href');
            if (!href) {
                return;
            }
            const search = href.split('?')[1] || '';
            const urlSearchParams = new URLSearchParams(search);
            this.updateUrl(this.createFacetsFormSearchParams(urlSearchParams));
        }
    }
    window.customElements.define('theme-facets-form', FacetsForm);
    class FacetsRemove extends HTMLElement {
        constructor() {
            super();
            this.#init();
        }
        #init() {
            const linkElement = this.querySelector('a');
            linkElement.addEventListener('click', (event) => {
                this.removeFilter(event);
            });
            linkElement.addEventListener('keyup', (event) => {
                event.preventDefault();
                if (event.code === 'Space') {
                    this.removeFilter(event);
                }
            });
        }
        removeFilter(event) {
            event.preventDefault();
            const facetsForm = this.closest('theme-facets-form');
            facetsForm.removeFilter(event);
        }
    }
    window.customElements.define('theme-facets-remove', FacetsRemove);
});
