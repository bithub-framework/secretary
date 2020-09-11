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
} from './interfaces';
import config from './config';
import { OrderId } from 'interfaces';

class ContextAccount implements ContextAccountPrivateApi {
    private marketConfig: InstanceConfig['markets'][0];
    private accountConfig: InstanceConfig['markets'][0]['accounts'][0];
    constructor(
        instanceConfig: InstanceConfig,
        mid: number,
        aid: number,
        private privateRequests: PrivateRequests,
    ) {
        this.marketConfig = instanceConfig.markets[mid];
        this.accountConfig = this.marketConfig.accounts[aid];
    }

    public async makeOrder(order: Order) {
        return this.privateRequests.makeOrder(
            `${this.marketConfig.exchange}/${this.marketConfig.pair}`,
            this.accountConfig,
            order,
        );
    }

    public async cancelOrder(oid: OrderId) {
        return this.privateRequests.cancelOrder(
            `${this.marketConfig.exchange}/${this.marketConfig.pair}`,
            this.accountConfig,
            oid,
        );
    }

    public async getOpenOrders() {
        return this.privateRequests.getOpenOrders(
            `${this.marketConfig.exchange}/${this.marketConfig.pair}`,
            this.accountConfig,
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
        privateRequest: PrivateRequests,
    ) {
        super();
        const marketConfig = instanceConfig.markets[mid];
        for (const aid of marketConfig.accounts.keys()) {
            this[aid] = new ContextAccount(
                instanceConfig, mid, aid,
                privateRequest,
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
    ) {
        super();
        const privateRequests = new PrivateRequests();
        for (const mid of this.instanceConfig.markets.keys()) {
            this[mid] = new ContextMarket(
                this.instanceConfig, mid,
                privateRequests,
            );
        }
    }

    protected async _start() {
        for (const mid of this.instanceConfig.markets.keys()) {
            await this[mid].start(err => void this.stop(err));
        }
    }

    protected async _stop() {
        for (const mid of this.instanceConfig.markets.keys()) {
            await this[mid].stop();
        }
    }
}

export {
    Context as default,
    Context,
}
