defineModule('theme-card-account-email', () => {
    class ThemeCardAccountEmail extends EmailAndPhoneModal {
        constructor() {
            super();
            this.registerInstanceToParent('email', this);
        }
        init() {
            super.init();
            this.accountInstance = new window.Shopline.customerAccount.BindCustomerEmail(this.formElement);
        }
    }
    window.customElements.define('theme-card-account-email', ThemeCardAccountEmail);
});
