export * from 'interfaces';
import { EventEmitter } from 'events';
import {
    Orderbook,
    LimitOrder,
    OpenOrder,
    Trade,
    OrderId,
} from './interfaces';
import { StartableLike } from 'startable';
import TtlQueue from 'ttl-queue';

// Context

export interface ContextLike {
    [marketId: number]: ContextMarketLike;
    sleep: (ms: number) => Promise<void>;
    next: () => Promise<void>;
}

export interface ContextMarketLike extends ContextMarketPublicApiLike {
    [accountId: number]: ContextAccountLike;
}

export interface ContextAccountLike extends ContextAccountPrivateApiLike { }

export interface ContextMarketPublicApiLike extends EventEmitter {
    orderbook: Orderbook;
    trades: TtlQueue<Trade>;
}

export interface ContextAccountPrivateApiLike {
    makeLimitOrder(order: LimitOrder): Promise<OrderId>;
    // getOrder(orderId: OrderId): Promise<Order>;
    getOpenOrders(): Promise<OpenOrder[]>;
    cancelOrder(orderId: OrderId): Promise<void>;
    // getAccount(): Promise<void>;
}

// Instances

export interface InstanceConfig {
    markets: {
        ORDERBOOK_URL: string;
        TRADES_URL: string;
        accounts: {
            URL: string;
        }[];
    }[],
    TRADE_TTL: number;
}

// Strategy

export interface StrategyConstructor {
    new(ctx: ContextLike): StartableLike;
}
