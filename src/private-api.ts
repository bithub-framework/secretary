import fetch from 'node-fetch';
import {
    LimitOrder,
    OpenOrder,
    OrderId,
    InstanceConfig,
    ContextAccountPrivateApiLike,
} from './interfaces';

class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    private accountConfig: InstanceConfig['markets'][0]['accounts'][0];

    constructor(
        config: InstanceConfig,
        mid: number,
        aid: number,
    ) {
        this.accountConfig = config.markets[mid].accounts[aid];
    }

    public async makeLimitOrder(order: LimitOrder): Promise<OrderId> {
        return fetch(
            `${this.accountConfig.URL}/make-limit-order`,
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
        return fetch(
            `${this.accountConfig.URL}/cancel-order?oid=${orderId}`,
        ).then(res => {
            if (!res.ok) throw new Error(res.statusText);
        });
    }

    public async getOpenOrders(): Promise<OpenOrder[]> {
        return fetch(
            `${this.accountConfig.URL}/get-open-orders`,
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
