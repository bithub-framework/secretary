import Startable from 'startable';
declare class Secretary extends Startable {
    private instanceConfig;
    private publicSockets;
    private ctx;
    private strategy?;
    constructor();
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectPublicCenter;
    private startStrategy;
}
export default Secretary;
export { Secretary };
