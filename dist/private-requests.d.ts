import { Order, OrderId, Config } from './interfaces';
declare class PrivateRequests {
    private config;
    constructor(config: Config);
    makeOrder(marketId: string, accountId: string, order: Order): Promise<OrderId>;
    cancelOrder(marketId: string, accountId: string, orderId: OrderId): Promise<void>;
    getOpenOrders(marketId: string, accountId: string): Promise<Order[]>;
    next(marketId: string, accountId: string): Promise<void>;
}
export default PrivateRequests;
export { PrivateRequests };
