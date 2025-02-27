defineModule('theme-product-volume-pricing', () => {
    class ProductVolumePricing extends BaseElement {
        #volumePricingList = [];
        constructor() {
            super();
            this.#volumePricingList = this.#parseVolumePricingList();
        }
        getMatchVolumePricing(quantity) {
            return this.#volumePricingList.find((cfg) => quantity >= cfg.quantity);
        }
        #parseVolumePricingList() {
            const list = Array.from(this.querySelectorAll('.volume-pricing__list .volume-pricing__item'));
            return list
                .map((li) => ({
                quantity: parseInt(li.querySelector('span:first-child').textContent, 10),
                price: li.querySelector('span:last-child').textContent,
            }))
                .reverse();
        }
    }
    customElements.define('theme-product-volume-pricing', ProductVolumePricing);
});
