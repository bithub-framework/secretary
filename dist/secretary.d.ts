import { Startable, StartableLike } from 'startable';
import Context from './context';
export declare type Strategy = StartableLike;
export interface StrategyCtor {
    new (ctx: Context): Strategy;
}
declare class Secretary extends Startable {
    private instanceConfig;
    private ctx;
    private strategy?;
    private publicSockets;
    constructor();
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectPublicCenter;
    private disconnectPublicCenter;
    private startStrategy;
}
export default Secretary;
export { Secretary };
