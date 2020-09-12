import Startable from 'startable';
import TtlQueue from 'ttl-queue';
// import pythonize from 'pythonized-array';
import Queue from 'queue';
import PrivateRequests from './private-requests';
import {
    ContextMarketPublicData,
    ContextAccountPrivateApi,
    InstanceConfig,
    Orderbook,
    Trade,
    Order,
    OrderId,
} from './interfaces';

class ContextAccount implements ContextAccountPrivateApi {
    constructor(
        private mid: number,
        private aid: number,
        private privateRequests: PrivateRequests,
    ) { }

    public async makeOrder(order: Order): Promise<OrderId> {
        return this.privateRequests.makeOrder(
            this.mid,
            this.aid,
            order,
        );
    }

    public async cancelOrder(oid: OrderId): Promise<void> {
        return this.privateRequests.cancelOrder(
            this.mid,
            this.aid,
            oid,
        );
    }

    public async getOpenOrders(): Promise<Order[]> {
        return this.privateRequests.getOpenOrders(
            this.mid,
            this.aid,
        );
    }
}

class ContextMarket extends Startable implements ContextMarketPublicData {
    [accountId: number]: ContextAccount;
    public orderbook: Orderbook;
    public trades: TtlQueue<Trade, NodeJS.Timeout>;

    constructor(
        instanceConfig: InstanceConfig,
        mid: number,
        privateRequests: PrivateRequests,
    ) {
        super();
        const marketConfig = instanceConfig.markets[mid];
        for (const aid of <number[]><unknown>Object.keys(marketConfig.accounts)) {
            this[aid] = new ContextAccount(
                mid, aid,
                privateRequests,
            );
        }
        this.trades = new TtlQueue<Trade, NodeJS.Timeout>({
            ttl: 2 * 60 * 1000,
            cleaningInterval: 10 * 1000,
            elemCarrierConstructor: Queue,
            timeCarrierConstructor: Queue,
        }, setTimeout, clearTimeout);
        // this.trades = pythonize<Trade>(this.trades);
        this.orderbook = {
            asks: [], bids: [], time: Number.NEGATIVE_INFINITY,
        }
    }

    protected async _start() {
        await this.trades.start(err => void this.stop(err));
    }

    protected async _stop() {
        await this.trades.stop();
    }
}

class Context extends Startable {
    [marketId: number]: ContextMarket;

    constructor(
        private instanceConfig: InstanceConfig,
        privateRequests: PrivateRequests,
    ) {
        super();
        for (const mid of <number[]><unknown>Object.keys(this.instanceConfig.markets)) {
            this[mid] = new ContextMarket(
                this.instanceConfig, mid,
                privateRequests,
            );
        }
    }

    protected async _start() {
        for (const mid of <number[]><unknown>Object.keys(this.instanceConfig.markets)) {
            await this[mid].start(err => void this.stop(err));
        }
    }

    protected async _stop() {
        for (const mid of <number[]><unknown>Object.keys(this.instanceConfig.markets)) {
            await this[mid].stop();
        }
    }

    public async next() { }
}

export {
    Context as default,
    Context,
}
