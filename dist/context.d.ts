/// <reference types="node" />
import Startable from 'startable';
import TtlQueue from 'ttl-queue';
import PrivateRequests from './private-requests';
import { ContextMarketPublicData, ContextAccountPrivateApi, InstanceConfig, Orderbook, Trade, Order } from './interfaces';
import { OrderId } from 'interfaces';
declare class ContextAccount implements ContextAccountPrivateApi {
    private privateRequests;
    private marketConfig;
    private accountConfig;
    constructor(instanceConfig: InstanceConfig, mid: number, aid: number, privateRequests: PrivateRequests);
    makeOrder(order: Order): Promise<unknown>;
    cancelOrder(oid: OrderId): Promise<void>;
    getOpenOrders(): Promise<Order[]>;
}
declare class ContextMarket extends Startable implements ContextMarketPublicData {
    [accountId: number]: ContextAccount;
    orderbook: Orderbook;
    trades: TtlQueue<Trade, NodeJS.Timeout>;
    constructor(instanceConfig: InstanceConfig, mid: number, privateRequest: PrivateRequests);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
declare class Context extends Startable {
    private instanceConfig;
    [marketId: number]: ContextMarket;
    constructor(instanceConfig: InstanceConfig, privateRequests: PrivateRequests);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { Context as default, Context, };
