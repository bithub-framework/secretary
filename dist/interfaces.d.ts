export * from 'interfaces';
import EventEmitter from 'eventemitter3';
import { Orderbook, Order, Trade, OrderId } from 'interfaces';
import { RandomAccessIterableQueueInterface as RAIQI } from 'queue';
export interface ContextMarketPublicData extends EventEmitter {
    orderbook: Orderbook;
    trades: RAIQI<Trade>;
}
export interface ContextAccountPrivateApi {
    makeOrder(order: Order): Promise<OrderId>;
    getOpenOrders(): Promise<Order[]>;
    cancelOrder(orderId: OrderId): Promise<void>;
}
export interface Context {
    [marketId: number]: ContextMarket;
}
export interface ContextMarket extends ContextMarketPublicData {
    [accountId: number]: ContextAccount;
}
export interface ContextAccount extends ContextAccountPrivateApi {
}
export interface InstanceConfig {
    markets: {
        exchange: string;
        pair: string;
        accounts: string[];
    }[];
    strategyPath: string;
    tradeTtl: number;
}
