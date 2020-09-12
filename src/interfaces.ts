export * from 'interfaces';
import EventEmitter from 'eventemitter3';
import {
    Orderbook,
    Order,
    Trade,
    OrderId,
} from 'interfaces';
import { RandomAccessIterableQueueInterface as RAIQI } from 'queue';
import { StartableLike } from 'startable';

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
        [marketId: number]: {
            orderbookUrl: string;
            tradesUrl: string;
            accounts: {
                [accountId: number]: string;
            };
        }
    },
    strategyPath: string;
    tradeTtl: number;
}

// Strategy

export type Strategy = StartableLike;

export interface StrategyCtor {
    new(ctx: Context): Strategy;
}
