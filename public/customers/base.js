class Customer extends BaseElement {
    async loadCustomerAccountSDK() {
        return new Promise((resolve, reject) => {
            window.Shopline.loadFeatures([
                {
                    name: 'customer-account-api',
                    version: '0.3',
                },
            ], (error) => {
                if (error) {
                    reject(error);
                    throw new Error('Failed to load customer account SDK');
                }
                resolve();
            });
        });
    }
    async loadToastSDK() {
        return new Promise((resolve, reject) => {
            window.Shopline.loadFeatures([
                {
                    name: 'component-toast',
                    version: '0.1',
                },
            ], (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
}
