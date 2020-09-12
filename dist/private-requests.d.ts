import { Order, OrderId, InstanceConfig } from './interfaces';
declare class PrivateRequests {
    private instanceConfig;
    constructor(instanceConfig: InstanceConfig);
    makeOrder(mid: number, aid: number, order: Order): Promise<OrderId>;
    cancelOrder(mid: number, aid: number, orderId: OrderId): Promise<void>;
    getOpenOrders(mid: number, aid: number): Promise<Order[]>;
}
export default PrivateRequests;
export { PrivateRequests };
