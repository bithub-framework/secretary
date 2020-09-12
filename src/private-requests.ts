import fetch from 'node-fetch';
import {
    Order,
    OrderId,
    InstanceConfig,
} from './interfaces';

class PrivateRequests {
    constructor(private instanceConfig: InstanceConfig) { }

    public async makeOrder(
        mid: number,
        aid: number,
        order: Order,
    ): Promise<OrderId> {
        return fetch(
            `${this.instanceConfig.markets[mid].accounts[aid]}/make-order`,
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

    public async cancelOrder(
        mid: number,
        aid: number,
        orderId: OrderId,
    ): Promise<void> {
        return fetch(
            `${this.instanceConfig.markets[mid].accounts[aid]}/cancel-order?oid=${orderId}`,
        ).then(res => {
            if (!res.ok) throw new Error(res.statusText);
        });
    }

    public async getOpenOrders(
        mid: number,
        aid: number,
    ): Promise<Order[]> {
        return fetch(
            `${this.instanceConfig.markets[mid].accounts[aid]}/get-open-orders`,
        ).then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        });
    }
}

export default PrivateRequests;
export { PrivateRequests };
