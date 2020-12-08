import { ContextMarketPublicApiLike, Orderbook, Trade, InstanceConfig } from './interfaces';
import TtlQueue from 'ttl-queue';
import Startable from 'startable';
declare class ContextMarketPublicApi extends Startable implements ContextMarketPublicApiLike {
    orderbook: Orderbook;
    trades: TtlQueue<Trade>;
    private oSocket;
    private tSocket;
    constructor(instanceConfig: InstanceConfig, mid: number);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private onOrderbook;
    private onTrades;
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
