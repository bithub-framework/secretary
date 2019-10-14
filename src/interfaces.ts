export * from 'interfaces';
export { PrivateRequests } from './private-requests';
import EventEmitter from 'events';
import WebSocket from 'ws';
import Queue from 'ttl-queue';
import {
    Orderbook,
    Trade,
} from 'interfaces';

// Context

interface ContextAccessor {
    (): Context;
    [marketId: string]: ContextMarketAccessor;
}

type Context = ContextMarket;

type ContextMarket = ContextPublicApi & ContextPrivateApi;

interface ContextMarketAccessor {
    (): ContextMarket;
    [account: string]: ContextAccountAccessor;
}

interface ContextPublicApi extends EventEmitter {
    orderbook: Orderbook;
    trades: Trade[];
}

interface ContextAccountAccessor {
    (): ContextAccount;
}

type ContextAccount = ContextPrivateApi;

interface ContextPrivateApi {
    makeOrder(): Promise<void>;
}

// Instances

interface InstanceConfig {
    markets: {
        [marketId: string]: {
            exchange: string;
            pair: string;
            accounts: string[];
        }
    },
    strategy: string;
}

// Strategy

interface Strategy {
    start(): any;
    stop(): any;
}

interface StrategyCtor {
    new(ctx: ContextAccessor): Strategy;
}

// Sockets

interface PublicSockets {
    [marketId: string]: {
        trades: WebSocket;
        orderbook: WebSocket;
    };
}

interface PrivateSockets {
    [marketId: string]: {
        [account: string]: WebSocket;
    }
}

// Config

interface Config {
    PRIVATE_CENTER_BASE_URL: string;
    PUBLIC_CENTER_BASE_URL: string;
    TRADE_TTL: number;
}

// data

interface PublicData {
    [marketId: string]: {
        orderbook: Orderbook;
        trades: Queue<Trade>;
    }
}

export {
    ContextAccessor,
    Context,

    ContextMarketAccessor,
    ContextMarket,

    ContextAccountAccessor,
    ContextAccount,

    ContextPublicApi,
    ContextPrivateApi,

    PublicSockets,
    PrivateSockets,

    StrategyCtor,
    Strategy,

    PublicData,
    InstanceConfig,
    Config,
};