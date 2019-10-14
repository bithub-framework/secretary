import Autonomous from 'autonomous';
declare class Secretary extends Autonomous {
    private serviceCtx;
    private instanceConfig;
    private publicSockets;
    private privateSockets;
    private ctx;
    private strategy;
    private privateRequests;
    private publicData;
    constructor(serviceCtx: any);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private readInstanceConfig;
    private configurePublicSockets;
    private configurePublicData;
    private startStrategy;
}
export default Secretary;
export { Secretary };
