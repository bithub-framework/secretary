import { Startable, StartableLike } from 'startable';
import { Config, ContextLike } from './interfaces';
interface StrategyConstructor {
    new (context: ContextLike): StartableLike;
}
declare class Secretary extends Startable {
    private config;
    private context;
    private strategy;
    constructor(Strategy: StrategyConstructor, config: Config);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { Secretary as default, Secretary, };
