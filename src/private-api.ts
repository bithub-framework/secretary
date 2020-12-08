import fetch from 'node-fetch';
import {
    LimitOrder,
    OpenOrder,
    OrderId,
    InstanceConfig,
    ContextAccountPrivateApiLike,
} from './interfaces';

class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    constructor(
        private config: InstanceConfig,
        private mid: number,
        private aid: number,
    ) { }

    public async makeLimitOrder(order: LimitOrder): Promise<OrderId> {
        const accountConfig = this.config.markets[this.mid].accounts[this.aid];
        return fetch(
            `${accountConfig.URL}/make-limit-order`,
            {
                method: 'post',
                body: JSON.stringify(order),
                headers: { 'Content-Type': 'application/json' },
            }
        ).then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }

    public async cancelOrder(orderId: OrderId): Promise<void> {
        const accountConfig = this.config.markets[this.mid].accounts[this.aid];
        return fetch(
            `${accountConfig.URL}/cancel-order?oid=${orderId}`,
        ).then(res => {
            if (!res.ok) throw new Error(res.statusText);
        });
    }

    public async getOpenOrders(): Promise<OpenOrder[]> {
        const accountConfig = this.config.markets[this.mid].accounts[this.aid];
        return fetch(
            `${accountConfig.URL}/get-open-orders`,
        ).then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }
}

export {
    ContextAccountPrivateApi as default,
    ContextAccountPrivateApi,
};
