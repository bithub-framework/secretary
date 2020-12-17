import { LimitOrder, OpenOrder, OrderId, InstanceConfig, ContextAccountPrivateApiLike, Assets } from './interfaces';
declare class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    private accountConfig;
    constructor(config: InstanceConfig, mid: number, aid: number);
    makeLimitOrder(order: LimitOrder): Promise<OrderId>;
    cancelOrder(orderId: OrderId): Promise<void>;
    getOpenOrders(): Promise<OpenOrder[]>;
    getAssets(): Promise<Assets>;
}
export { ContextAccountPrivateApi as default, ContextAccountPrivateApi, };
