import { LimitOrder, OpenOrder, OrderId, InstanceConfig, ContextAccountPrivateApiLike } from './interfaces';
declare class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    private config;
    private mid;
    private aid;
    constructor(config: InstanceConfig, mid: number, aid: number);
    makeLimitOrder(order: LimitOrder): Promise<OrderId>;
    cancelOrder(orderId: OrderId): Promise<void>;
    getOpenOrders(): Promise<OpenOrder[]>;
}
export { ContextAccountPrivateApi as default, ContextAccountPrivateApi, };
