import Startable from 'startable';
import TtlQueue from 'ttl-queue';
// import pythonize from 'pythonized-array';
import Queue from 'queue';
import PrivateRequests from './private-requests';
class ContextAccount {
    constructor(instanceConfig, mid, aid, privateRequests) {
        this.privateRequests = privateRequests;
        this.marketConfig = instanceConfig.markets[mid];
        this.accountConfig = this.marketConfig.accounts[aid];
    }
    async makeOrder(order) {
        return this.privateRequests.makeOrder(`${this.marketConfig.exchange}/${this.marketConfig.pair}`, this.accountConfig, order);
    }
    async cancelOrder(oid) {
        return this.privateRequests.cancelOrder(`${this.marketConfig.exchange}/${this.marketConfig.pair}`, this.accountConfig, oid);
    }
    async getOpenOrders() {
        return this.privateRequests.getOpenOrders(`${this.marketConfig.exchange}/${this.marketConfig.pair}`, this.accountConfig);
    }
}
class ContextMarket extends Startable {
    constructor(instanceConfig, mid, privateRequest) {
        super();
        const marketConfig = instanceConfig.markets[mid];
        for (const aid of marketConfig.accounts.keys()) {
            this[aid] = new ContextAccount(instanceConfig, mid, aid, privateRequest);
        }
        this.trades = new TtlQueue({
            ttl: 2 * 60 * 1000,
            cleaningInterval: 10 * 1000,
            elemCarrierConstructor: Queue,
            timeCarrierConstructor: Queue,
        }, setTimeout, clearTimeout);
        // this.trades = pythonize<Trade>(this.trades);
        this.orderbook = {
            asks: [], bids: [], time: Number.NEGATIVE_INFINITY,
        };
    }
    async _start() {
        await this.trades.start(err => void this.stop(err));
    }
    async _stop() {
        await this.trades.stop();
    }
}
class Context extends Startable {
    constructor(instanceConfig) {
        super();
        this.instanceConfig = instanceConfig;
        const privateRequests = new PrivateRequests();
        for (const mid of this.instanceConfig.markets.keys()) {
            this[mid] = new ContextMarket(this.instanceConfig, mid, privateRequests);
        }
    }
    async _start() {
        for (const mid of this.instanceConfig.markets.keys()) {
            await this[mid].start(err => void this.stop(err));
        }
    }
    async _stop() {
        for (const mid of this.instanceConfig.markets.keys()) {
            await this[mid].stop();
        }
    }
}
export { Context as default, Context, };
//# sourceMappingURL=context.js.map