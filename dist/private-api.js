import fetch from 'node-fetch';
class ContextAccountPrivateApi {
    constructor(config, mid, aid) {
        this.config = config;
        this.mid = mid;
        this.aid = aid;
    }
    async makeLimitOrder(order) {
        const accountConfig = this.config.markets[this.mid].accounts[this.aid];
        return fetch(`${accountConfig.URL}/make-limit-order`, {
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
        const accountConfig = this.config.markets[this.mid].accounts[this.aid];
        return fetch(`${accountConfig.URL}/cancel-order?oid=${orderId}`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
        });
    }
    async getOpenOrders() {
        const accountConfig = this.config.markets[this.mid].accounts[this.aid];
        return fetch(`${accountConfig.URL}/get-open-orders`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        });
    }
}
export { ContextAccountPrivateApi as default, ContextAccountPrivateApi, };
//# sourceMappingURL=private-api.js.map