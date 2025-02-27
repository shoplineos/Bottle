defineModule('theme-card-account-phone', () => {
    class ThemeCardAccountPhone extends EmailAndPhoneModal {
        constructor() {
            super();
            this.registerInstanceToParent('phone', this);
        }
        init() {
            super.init();
            this.accountInstance = new window.Shopline.customerAccount.BindCustomerPhone(this.formElement);
        }
    }
    window.customElements.define('theme-card-account-phone', ThemeCardAccountPhone);
});
