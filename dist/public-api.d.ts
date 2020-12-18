import { ContextMarketPublicApiLike, Config } from './interfaces';
import Startable from 'startable';
declare class ContextMarketPublicApi extends Startable implements ContextMarketPublicApiLike {
    private oSocket;
    private tSocket;
    constructor(instanceConfig: Config, mid: number);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private onOrderbook;
    private onTrades;
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
