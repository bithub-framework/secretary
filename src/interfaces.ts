export * from 'interfaces';
import EventEmitter from 'eventemitter3';
import {
    Orderbook,
    Order,
    Trade,
    OrderId,
} from 'interfaces';
import { StartableLike } from 'startable';
import { RandomAccessIterableQueueInterface as RAIQI } from 'queue';

// Context

export interface ContextMarketPublicData extends EventEmitter {
    orderbook: Orderbook;
    trades: RAIQI<Trade>;
}

export interface ContextAccountPrivateApi {
    makeOrder(order: Order): Promise<OrderId>;
    // getOrder(orderId: OrderId): Promise<Order>;
    getOpenOrders(): Promise<Order[]>;
    cancelOrder(orderId: OrderId): Promise<void>;
    // getAccount(): Promise<void>;
}

export interface Context {
    [marketId: number]: ContextMarket;
}

export interface ContextMarket extends ContextMarketPublicData {
    [accountId: number]: ContextAccount;
}

export interface ContextAccount extends ContextAccountPrivateApi { }

// Instances

export interface InstanceConfig {
    markets: {
        exchange: string;
        pair: string;
        accounts: string[];
    }[],
    strategyPath: string;
    tradeTtl: number;
}
