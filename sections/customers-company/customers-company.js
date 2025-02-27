defineModule('theme-main-company', () => {
    class ThemeMainCompany extends BaseElement {
        #companyFormElement = null;
        #checkboxElement = null;
        #billingElement = null;
        constructor() {
            super();
            this.#companyFormElement = this.querySelector('.customer-company__form');
            this.#checkboxElement = this.querySelector('.customer__extra input[type="checkbox"]');
            this.#billingElement = this.querySelector('.customer-company__billing');
            if (this.#companyFormElement) {
                this.#companyFormElement.addEventListener('submit', this.#onSubmitHandler.bind(this));
            }
            if (this.#checkboxElement) {
                this.#checkboxElement.addEventListener('change', this.#onCheckboxChange.bind(this));
            }
        }
        #onCheckboxChange(event) {
            const { checked } = event.target;
            this.#billingElement?.classList.toggle('hidden', checked);
        }
        #onSubmitHandler(event) {
            event.preventDefault();
            const valid = this.#companyFormElement?.checkValidity();
            if (valid && this.#companyFormElement) {
                const formData = new FormData(this.#companyFormElement);
                if (this.#checkboxElement?.checked) {
                    this.fillSameAsShippingAddress(formData);
                }
                this.#companyFormElement?.submit();
            }
            else {
                this.#companyFormElement?.reportValidity();
            }
        }
        fillSameAsShippingAddress(formData) {
            const mobilePhone = formData.get('company[shipping_address][mobile_phone]');
            const countryCode = formData.get('company[shipping_address][country_code]');
            const provinceCode = formData.get('company[shipping_address][province_code]');
            const province = formData.get('company[shipping_address][province]');
            const cityCode = formData.get('company[shipping_address][city_code]');
            const city = formData.get('company[shipping_address][city]');
            const districtCode = formData.get('company[shipping_address][district_code]');
            const district = formData.get('company[shipping_address][district]');
            const zipCode = formData.get('company[shipping_address][zip_code]');
            const address = formData.get('company[shipping_address][addr]');
            const address2 = formData.get('company[shipping_address][addr_two]');
            if (this.#billingElement) {
                this.#billingElement.querySelector('[name="company[billing_address][mobile_phone]"]').value = mobilePhone;
                this.#billingElement.querySelector('[name="company[billing_address][country_code]"]').value = countryCode;
                const billingProvinceSelectElement = this.#billingElement.querySelector('[name="company[billing_address][province_code]"]');
                if (billingProvinceSelectElement) {
                    const shippingProvinceCodeElement = this.#companyFormElement?.querySelector('[name="company[shipping_address][province_code]"]');
                    billingProvinceSelectElement.innerHTML = shippingProvinceCodeElement?.innerHTML || '';
                }
                this.#billingElement.querySelector('[name="company[billing_address][province_code]"]').value = provinceCode;
                this.#billingElement.querySelector('[name="company[billing_address][province]"]').value =
                    province;
                const billingCitySelectElement = this.#billingElement.querySelector('[name="company[billing_address][city_code]"]');
                if (billingCitySelectElement) {
                    const shippingCityCodeElement = this.#companyFormElement?.querySelector('[name="company[shipping_address][city_code]"]');
                    billingCitySelectElement.innerHTML = shippingCityCodeElement?.innerHTML || '';
                }
                this.#billingElement.querySelector('[name="company[billing_address][city_code]"]').value =
                    cityCode;
                this.#billingElement.querySelector('[name="company[billing_address][city]"]').value = city;
                const billingDistrictSelectElement = this.#billingElement.querySelector('[name="company[billing_address][district_code]"]');
                if (billingDistrictSelectElement) {
                    const shippingDistrictCodeElement = this.#companyFormElement?.querySelector('[name="company[shipping_address][district_code]"]');
                    billingDistrictSelectElement.innerHTML = shippingDistrictCodeElement?.innerHTML || '';
                }
                this.#billingElement.querySelector('[name="company[billing_address][district_code]"]').value = districtCode;
                this.#billingElement.querySelector('[name="company[billing_address][district]"]').value =
                    district;
                this.#billingElement.querySelector('[name="company[billing_address][zip_code]"]').value =
                    zipCode;
                this.#billingElement.querySelector('[name="company[billing_address][addr]"]').value =
                    address;
                this.#billingElement.querySelector('[name="company[billing_address][addr_two]"]').value =
                    address2;
            }
        }
    }
    window.customElements.define('theme-main-company', ThemeMainCompany);
});
