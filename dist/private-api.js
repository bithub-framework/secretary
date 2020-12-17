import fetch from 'node-fetch';
class ContextAccountPrivateApi {
    constructor(config, mid, aid) {
        this.accountConfig = config.markets[mid].accounts[aid];
    }
    async makeLimitOrder(order) {
        return fetch(`${this.accountConfig.URL}/make-limit-order`, {
            method: 'post',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        });
    }
    async cancelOrder(orderId) {
        return fetch(`${this.accountConfig.URL}/cancel-order?oid=${orderId}`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
        });
    }
    async getOpenOrders() {
        return fetch(`${this.accountConfig.URL}/get-open-orders`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        });
    }
    async getAssets() {
        return fetch(`${this.accountConfig.URL}/get-assets`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        });
    }
}
export { ContextAccountPrivateApi as default, ContextAccountPrivateApi, };
//# sourceMappingURL=private-api.js.map