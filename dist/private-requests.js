import fetch from 'node-fetch';
import config from './config';
class PrivateRequests {
    async makeOrder(marketName, accountName, order) {
        return fetch(`${config.PRIVATE_CENTER_BASE_URL}/${marketName}/${accountName}/make-order`, {
            method: 'post',
            body: JSON.stringify(order),
            headers: { 'Content-Type': 'application/json' },
        });
    }
    async cancelOrder(marketName, accountName, orderId) {
        return fetch(`${config.PRIVATE_CENTER_BASE_URL}/${marketName}/${accountName}/cancel-order?oid=${orderId}`).then(() => { });
    }
    async getOpenOrders(marketName, accountName) {
        return fetch(`${config.PRIVATE_CENTER_BASE_URL}/${marketName}/${accountName}/get-open-orders`).then(res => res.json());
    }
}
export default PrivateRequests;
export { PrivateRequests };
//# sourceMappingURL=private-requests.js.map