import fetch from 'node-fetch';
class PrivateRequests {
    constructor(instanceConfig) {
        this.instanceConfig = instanceConfig;
    }
    async makeOrder(mid, aid, order) {
        return fetch(`${this.instanceConfig.markets[mid].accounts[aid]}/make-order`, {
            method: 'post',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        });
    }
    async cancelOrder(mid, aid, orderId) {
        return fetch(`${this.instanceConfig.markets[mid].accounts[aid]}/cancel-order?oid=${orderId}`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
        });
    }
    async getOpenOrders(mid, aid) {
        return fetch(`${this.instanceConfig.markets[mid].accounts[aid]}/get-open-orders`).then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res.json();
        });
    }
}
export default PrivateRequests;
export { PrivateRequests };
//# sourceMappingURL=private-requests.js.map