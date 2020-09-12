/// <reference types="node" />
import Startable from 'startable';
import TtlQueue from 'ttl-queue';
import PrivateRequests from './private-requests';
import { ContextMarketPublicData, ContextAccountPrivateApi, InstanceConfig, Orderbook, Trade, Order, OrderId } from './interfaces';
declare class ContextAccount implements ContextAccountPrivateApi {
    private mid;
    private aid;
    private privateRequests;
    constructor(mid: number, aid: number, privateRequests: PrivateRequests);
    makeOrder(order: Order): Promise<OrderId>;
    cancelOrder(oid: OrderId): Promise<void>;
    getOpenOrders(): Promise<Order[]>;
}
declare class ContextMarket extends Startable implements ContextMarketPublicData {
    [accountId: number]: ContextAccount;
    orderbook: Orderbook;
    trades: TtlQueue<Trade, NodeJS.Timeout>;
    constructor(instanceConfig: InstanceConfig, mid: number, privateRequests: PrivateRequests);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
declare class Context extends Startable {
    private instanceConfig;
    [marketId: number]: ContextMarket;
    constructor(instanceConfig: InstanceConfig, privateRequests: PrivateRequests);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    next(): Promise<void>;
}
export { Context as default, Context, };
