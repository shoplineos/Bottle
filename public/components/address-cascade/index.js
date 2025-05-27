class ThemeAddressCascade extends BaseElement {
    #config = {
        country: { display: true, type: 'select' },
        province: { display: false, type: 'select' },
        city: { display: false, type: 'input' },
        district: { display: false, type: 'input' },
    };
    #countrySelector = this.querySelector('#AddressCountry');
    #provinceSelector = this.querySelector('#AddressProvinceSelect');
    #citySelector = this.querySelector('#AddressCitySelect');
    #districtSelector = this.querySelector('#AddressDistrictSelect');
    #provinceInput = this.querySelector('#AddressProvinceInput');
    #cityInput = this.querySelector('#AddressCityInput');
    #districtInput = this.querySelector('#AddressDistrictInput');
    #provinceGroup = this.querySelector('#AddressProvinceGroup');
    #cityGroup = this.querySelector('#AddressCityGroup');
    #districtGroup = this.querySelector('#AddressDistrictGroup');
    #getAddressFieldType(type) {
        return type === 1 ? 'select' : 'input';
    }
    #buildOptions(name, value) {
        return `<option value="${value}">${name}</option>`;
    }
    #getParentSelectorElement(fieldName) {
        const levels = [
            { name: 'district', el: this.#districtSelector },
            { name: 'city', el: this.#citySelector },
            { name: 'province', el: this.#provinceSelector },
            { name: 'country', el: this.#countrySelector },
        ];
        const index = levels.findIndex((level) => level.name === fieldName);
        const partnerList = levels.slice(index + 1);
        const foundParent = partnerList.find(({ name }) => {
            if (!(name in this.#config)) {
                return false;
            }
            return this.#config[name].display;
        });
        return foundParent?.el;
    }
    async #fetchAddressTemplate(country) {
        const url = window.routes.addressCountryTemplateUrl;
        const search = new URLSearchParams({
            country,
            language: window.Shopline.locale,
        });
        const response = await fetch(`${url}?${search.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch address template');
        }
        const body = await response.json();
        const props = body.data?.props;
        if (!props) {
            throw new Error('Failed to fetch address template');
        }
        const countryTemplate = props.find((item) => item.propKey === 'country');
        const provinceTemplate = props.find((item) => item.propKey === 'province');
        const cityTemplate = props.find((item) => item.propKey === 'city');
        const districtTemplate = props.find((item) => item.propKey === 'district');
        return {
            country: {
                display: !!countryTemplate?.display,
                type: this.#getAddressFieldType(countryTemplate?.interactionType),
                title: countryTemplate?.title,
                targetLevel: 0,
                required: countryTemplate.required,
                remindCopywriter: countryTemplate?.remindCopywriter,
            },
            province: {
                display: !!provinceTemplate?.display,
                type: this.#getAddressFieldType(provinceTemplate?.interactionType),
                title: provinceTemplate?.title,
                targetLevel: 1,
                required: provinceTemplate?.required,
                remindCopywriter: provinceTemplate?.remindCopywriter,
                inputElement: this.#provinceInput,
            },
            city: {
                display: !!cityTemplate?.display,
                type: this.#getAddressFieldType(cityTemplate?.interactionType),
                title: cityTemplate?.title,
                targetLevel: 2,
                required: cityTemplate?.required,
                remindCopywriter: cityTemplate?.remindCopywriter,
                inputElement: this.#cityInput,
            },
            district: {
                display: !!districtTemplate?.display,
                type: this.#getAddressFieldType(districtTemplate?.interactionType),
                title: districtTemplate?.title,
                targetLevel: 3,
                required: districtTemplate?.required,
                remindCopywriter: districtTemplate?.remindCopywriter,
                inputElement: this.#districtInput,
            },
        };
    }
    async #fetchCountryOptions() {
        const url = window.routes.addressCountriesUrl;
        const search = new URLSearchParams({
            language: window.Shopline.locale,
        });
        const response = await fetch(`${url}?${search.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch country options');
        }
        const body = await response.json();
        const { countries } = body.data;
        return countries;
    }
    async #fetchNextLevelOptions(fieldName) {
        const config = this.#config[fieldName];
        const parent = this.#getParentSelectorElement(fieldName);
        if (!parent) {
            return [];
        }
        const parentCode = parent.value;
        const countryCode = this.#countrySelector.value;
        if (!parentCode || !config.display || config.type === 'input') {
            return [];
        }
        const search = new URLSearchParams({
            parentCode,
            countryCode,
            language: window.Shopline.locale,
            targetLevel: config.targetLevel?.toString() ?? '',
        });
        const url = window.routes.addressNextUrl;
        const response = await fetch(`${url}?${search.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch next level options of ${fieldName}.`);
        }
        const body = await response.json();
        const { addressInfoList } = body.data;
        return addressInfoList;
    }
    #renderAddressForm() {
        const { country, province, city, district } = this.#config;
        if (country.display) {
            const label = this.#countrySelector.nextElementSibling;
            if (label && country.title) {
                label.innerHTML = country.title;
            }
        }
        if (province.display) {
            this.#provinceGroup.classList.add('shown');
            if (province.type === 'select') {
                this.#provinceGroup.classList.add('select');
                const label = this.#provinceSelector.nextElementSibling;
                if (label && province.title) {
                    label.innerHTML = province.title;
                }
                this.#provinceInput.required = false;
            }
            else {
                this.#provinceGroup.classList.remove('select');
                const label = this.#provinceInput.nextElementSibling;
                if (label && province.title) {
                    label.innerHTML = province.title;
                }
                this.#provinceInput.required = province.required;
            }
            this.#addValidationListeners(province);
        }
        else {
            this.#provinceGroup.classList.remove('shown');
        }
        if (city.display) {
            this.#cityGroup.classList.add('shown');
            if (city.type === 'select') {
                this.#cityGroup.classList.add('select');
                const label = this.#citySelector.nextElementSibling;
                if (label && city.title) {
                    label.innerHTML = city.title;
                }
                this.#cityInput.required = false;
            }
            else {
                this.#cityGroup.classList.remove('select');
                const label = this.#cityInput.nextElementSibling;
                if (label && city.title) {
                    label.innerHTML = city.title;
                }
                this.#cityInput.required = city.required;
            }
            this.#addValidationListeners(city);
        }
        else {
            this.#cityGroup.classList.remove('shown');
        }
        if (district.display) {
            this.#districtGroup.classList.add('shown');
            if (district.type === 'select') {
                this.#districtGroup.classList.add('select');
                const label = this.#districtSelector.nextElementSibling;
                if (label && district.title) {
                    label.innerHTML = district.title;
                }
                this.#districtInput.required = false;
            }
            else {
                this.#districtGroup.classList.remove('select');
                const label = this.#districtInput.nextElementSibling;
                if (label && district.title) {
                    label.innerHTML = district.title;
                }
                this.#districtInput.required = district.required;
            }
            this.#addValidationListeners(district);
        }
        else {
            this.#districtGroup.classList.remove('shown');
        }
    }
    #addValidationListeners(currentLevelConfig) {
        const { inputElement, remindCopywriter, required } = currentLevelConfig;
        const listenerKey = '_validationHandlers';
        this.#removeCustomValidityListeners(inputElement, listenerKey);
        if (required) {
            const handleInvalid = () => {
                if (inputElement.validity.valueMissing) {
                    inputElement.setCustomValidity(remindCopywriter);
                }
            };
            const handleCustomValidityInput = () => {
                inputElement.setCustomValidity('');
            };
            inputElement.addEventListener('invalid', handleInvalid);
            inputElement.addEventListener('input', handleCustomValidityInput);
            inputElement[listenerKey] = {
                invalid: handleInvalid,
                input: handleCustomValidityInput,
            };
        }
        else {
            inputElement.setCustomValidity('');
        }
    }
    #removeCustomValidityListeners(element, key) {
        if (!element || !(key in element))
            return;
        const handlers = element[key];
        const typedHandlers = handlers;
        element.removeEventListener('invalid', typedHandlers.invalid);
        element.removeEventListener('input', typedHandlers.input);
        delete element[key];
        element.setCustomValidity('');
    }
    #clearProvince() {
        this.#provinceSelector.innerHTML = '';
        this.#provinceSelector.value = '';
        this.#provinceInput.value = '';
    }
    #clearCity() {
        this.#citySelector.innerHTML = '';
        this.#citySelector.value = '';
        this.#cityInput.value = '';
    }
    #clearDistrict() {
        this.#districtSelector.innerHTML = '';
        this.#districtSelector.value = '';
        this.#districtInput.value = '';
    }
    async #updateProvince(value) {
        if (this.#config.province.type === 'select') {
            const provinces = await this.#fetchNextLevelOptions('province');
            const options = provinces.map(({ name, code }) => this.#buildOptions(name, code));
            this.#provinceSelector.innerHTML = options.join('');
            if (typeof value === 'string') {
                this.#provinceSelector.value = value;
            }
        }
        else if (typeof value === 'string') {
            this.#provinceInput.value = value;
        }
    }
    async #updateCity(value) {
        if (this.#config.city.type === 'select') {
            const cities = await this.#fetchNextLevelOptions('city');
            const options = cities.map(({ name, code }) => this.#buildOptions(name, code));
            this.#citySelector.innerHTML = options.join('');
            if (typeof value === 'string') {
                this.#citySelector.value = value;
            }
        }
        else if (typeof value === 'string') {
            this.#cityInput.value = value;
        }
    }
    async #updateDistrict(value) {
        if (this.#config.district.type === 'select') {
            const districts = await this.#fetchNextLevelOptions('district');
            const options = districts.map(({ name, code }) => this.#buildOptions(name, code));
            this.#districtSelector.innerHTML = options.join('');
            if (typeof value === 'string') {
                this.#districtSelector.value = value;
            }
        }
        else if (typeof value === 'string') {
            this.#districtInput.value = value;
        }
    }
    #countryChangedHandler = async (event) => {
        if (!(event.target instanceof HTMLSelectElement)) {
            throw new Error('Invalid event target.');
        }
        this.#clearProvince();
        this.#clearCity();
        this.#clearDistrict();
        const code = event.target.value;
        this.#config = await this.#fetchAddressTemplate(code);
        this.#renderAddressForm();
        await this.#updateProvince();
        await this.#updateCity();
        await this.#updateDistrict();
    };
    #provinceChangedHandler = async (event) => {
        if (!(event.target instanceof HTMLSelectElement)) {
            throw new Error('Invalid event target.');
        }
        this.#clearCity();
        this.#clearDistrict();
        await this.#updateCity();
        await this.#updateDistrict();
    };
    #cityChangedHandler = async (event) => {
        if (!(event.target instanceof HTMLSelectElement)) {
            throw new Error('Invalid event target.');
        }
        this.#clearDistrict();
        await this.#updateDistrict();
    };
    async #initSelectors() {
        const defaultCountryCode = this.#countrySelector.dataset.default || undefined;
        const defaultProvinceCode = this.#provinceSelector.dataset.default || undefined;
        const defaultCityCode = this.#citySelector.dataset.default || undefined;
        const defaultDistrictCode = this.#districtSelector.dataset.default || undefined;
        const countries = await this.#fetchCountryOptions();
        const options = countries.map((country) => this.#buildOptions(country.name, country.countryCode));
        this.#countrySelector.innerHTML = options.join('');
        let code = defaultCountryCode;
        if (code && countries.some((country) => country.countryCode === code)) {
            this.#countrySelector.value = code;
        }
        else {
            code = countries[0].countryCode;
            this.#countrySelector.value = code;
        }
        this.#config = await this.#fetchAddressTemplate(code);
        this.#renderAddressForm();
        await this.#updateProvince(defaultProvinceCode);
        await this.#updateCity(defaultCityCode);
        await this.#updateDistrict(defaultDistrictCode);
    }
    mounted() {
        this.#initSelectors();
        this.#countrySelector.addEventListener('change', this.#countryChangedHandler);
        this.#provinceSelector.addEventListener('change', this.#provinceChangedHandler);
        this.#citySelector.addEventListener('change', this.#cityChangedHandler);
    }
}
customElements.define('theme-address-cascade', ThemeAddressCascade);
