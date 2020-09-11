import { Order, OrderId } from './interfaces';
declare class PrivateRequests {
    makeOrder(marketName: string, accountName: string, order: Order): Promise<OrderId>;
    cancelOrder(marketName: string, accountName: string, orderId: OrderId): Promise<void>;
    getOpenOrders(marketName: string, accountName: string): Promise<Order[]>;
}
export default PrivateRequests;
export { PrivateRequests };
