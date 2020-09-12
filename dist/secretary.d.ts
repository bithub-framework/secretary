import Startable from 'startable';
declare class Secretary extends Startable {
    private instanceConfig;
    private ctx;
    private strategy?;
    private publicSockets;
    constructor();
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectPublicAgents;
    private disconnectPublicAgents;
    private startStrategy;
}
export default Secretary;
export { Secretary };
