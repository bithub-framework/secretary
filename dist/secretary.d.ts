import { Startable, StartableLike } from 'startable';
import { InstanceConfig, ContextLike } from './interfaces';
interface StrategyConstructor {
    new (context: ContextLike): StartableLike;
}
declare class Secretary extends Startable {
    private instanceConfig;
    private context;
    private strategy;
    constructor(Strategy: StrategyConstructor, instanceConfig: InstanceConfig);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { Secretary as default, Secretary, };
