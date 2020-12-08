import Startable from 'startable';
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import Bluebird from 'bluebird';
import { InstanceConfig, ContextAccountLike, ContextMarketLike, ContextLike } from './interfaces';
declare class Context extends Startable implements ContextLike {
    private config;
    [marketId: number]: ContextMarket;
    sleep: typeof Bluebird.delay;
    constructor(config: InstanceConfig);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    next(): Promise<void>;
}
declare class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;
    constructor(config: InstanceConfig, mid: number);
}
declare class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike {
}
export { Context as default, Context, };
