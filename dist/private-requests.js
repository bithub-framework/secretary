"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class PrivateRequests {
    constructor(config) {
        this.config = config;
    }
    makeOrder(marketId, accountId, order) {
        return axios_1.default.post(`${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId}/make-order`, order);
    }
    cancelOrder(marketId, accountId, orderId) {
        return axios_1.default.put(`${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId}/cancel-order`, orderId);
    }
    getOpenOrders(marketId, accountId) {
        return axios_1.default.get(`${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId}/get-open-orders`);
    }
}
exports.PrivateRequests = PrivateRequests;
exports.default = PrivateRequests;
//# sourceMappingURL=private-requests.js.map