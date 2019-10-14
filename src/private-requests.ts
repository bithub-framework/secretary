import axios from 'axios';
import {
    Order,
    OrderId,
    Config,
} from './interfaces';

class PrivateRequests {
    constructor(private config: Config) {

    }

    public makeOrder(
        marketId: string,
        accountId: string,
        order: Order,
    ): Promise<OrderId> {
        return axios.post(
            `${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId
            }/make-order`,
            order,
        );
    }

    public cancelOrder(
        marketId: string,
        accountId: string,
        orderId: OrderId,
    ): Promise<void> {
        return axios.put(
            `${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId
            }/cancel-order`,
            orderId,
        );
    }

    public getOpenOrders(
        marketId: string,
        accountId: string,
    ): Promise<Order[]> {
        return axios.get(
            `${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId
            }/get-open-orders`,
        );
    }

    public next(
        marketId: string,
        accountId: string,
    ): Promise<void> {
        return axios.post(
            `${this.config.PRIVATE_CENTER_BASE_URL}/${marketId}/${accountId
            }/next`
        );
    }
}

export default PrivateRequests;
export { PrivateRequests };