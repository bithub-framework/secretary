import Startable from 'startable';
import TtlQueue from 'ttl-queue';
// import pythonize from 'pythonized-array';
import Queue from 'queue';
class ContextAccount {
    constructor(mid, aid, privateRequests) {
        this.mid = mid;
        this.aid = aid;
        this.privateRequests = privateRequests;
    }
    async makeOrder(order) {
        return this.privateRequests.makeOrder(this.mid, this.aid, order);
    }
    async cancelOrder(oid) {
        return this.privateRequests.cancelOrder(this.mid, this.aid, oid);
    }
    async getOpenOrders() {
        return this.privateRequests.getOpenOrders(this.mid, this.aid);
    }
}
class ContextMarket extends Startable {
    constructor(instanceConfig, mid, privateRequests) {
        super();
        const marketConfig = instanceConfig.markets[mid];
        for (const aid of Object.keys(marketConfig.accounts)) {
            this[aid] = new ContextAccount(mid, aid, privateRequests);
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
    constructor(instanceConfig, privateRequests) {
        super();
        this.instanceConfig = instanceConfig;
        for (const mid of Object.keys(this.instanceConfig.markets)) {
            this[mid] = new ContextMarket(this.instanceConfig, mid, privateRequests);
        }
    }
    async _start() {
        for (const mid of Object.keys(this.instanceConfig.markets)) {
            await this[mid].start(err => void this.stop(err));
        }
    }
    async _stop() {
        for (const mid of Object.keys(this.instanceConfig.markets)) {
            await this[mid].stop();
        }
    }
    async next() { }
}
export { Context as default, Context, };
//# sourceMappingURL=context.js.map