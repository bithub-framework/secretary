import { Startable, StartableLike } from 'startable';
import { InstanceConfig } from './interfaces';
declare class Secretary extends Startable {
    private strategy;
    private instanceConfig;
    private ctx;
    constructor(strategy: StartableLike, instanceConfig: InstanceConfig);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { Secretary as default, Secretary, };
