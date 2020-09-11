import fetch from 'node-fetch';
import {
    Order,
    OrderId,
} from './interfaces';
import config from './config';

class PrivateRequests {
    public makeOrder(
        marketName: string,
        accountName: string,
        order: Order,
    ): Promise<OrderId> {
        return fetch(
            `${config.PRIVATE_CENTER_BASE_URL}/${marketName}/${accountName
            }/make-order`,
            {
                method: 'post',
                body: JSON.stringify(order),
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    public cancelOrder(
        marketName: string,
        accountName: string,
        orderId: OrderId,
    ): Promise<void> {
        return fetch(
            `${config.PRIVATE_CENTER_BASE_URL}/${marketName}/${accountName
            }/cancel-order?oid=${orderId}`,
        ).then(() => { });
    }

    public getOpenOrders(
        marketName: string,
        accountName: string,
    ): Promise<Order[]> {
        return fetch(
            `${config.PRIVATE_CENTER_BASE_URL}/${marketName}/${accountName
            }/get-open-orders`,
        ).then(res => res.json());
    }
}

export default PrivateRequests;
export { PrivateRequests };
