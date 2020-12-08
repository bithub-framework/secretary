import TtlQueue from 'ttl-queue';
import Startable from 'startable';
import config from './config';
import { PromisifiedWebSocket } from 'promisified-websocket';
class ContextMarketPublicApi extends Startable {
    constructor(instanceConfig, mid) {
        super();
        this.onOrderbook = (message) => {
            try {
                const orderbook = JSON.parse(message);
                this.orderbook = orderbook;
                this.emit('orderbook', orderbook);
            }
            catch (err) {
                this.stop().catch(() => { });
            }
        };
        this.onTrades = (message) => {
            try {
                const trades = JSON.parse(message);
                trades.forEach(trade => void this.trades.push(trade, trade.time));
                this.emit('trades', trades);
            }
            catch (err) {
                this.stop().catch(() => { });
            }
        };
        this.trades = new TtlQueue({
            ttl: instanceConfig.TRADE_TTL,
            cleaningInterval: config.CLEANING_INTERVAL,
        });
        this.orderbook = {
            asks: [], bids: [], time: Number.NEGATIVE_INFINITY,
        };
        const marketConfig = instanceConfig.markets[mid];
        this.oSocket = new PromisifiedWebSocket(marketConfig.ORDERBOOK_URL);
        this.tSocket = new PromisifiedWebSocket(marketConfig.TRADES_URL);
    }
    async _start() {
        await this.trades.start(err => void this.stop(err).catch(() => { }));
        await this.oSocket.start(err => void this.stop(err).catch(() => { }));
        this.oSocket.on('message', this.onOrderbook);
        await this.tSocket.start(err => void this.stop(err).catch(() => { }));
        this.tSocket.on('message', this.onTrades);
    }
    async _stop() {
        this.oSocket.off('message', this.onOrderbook);
        await this.oSocket.stop();
        this.tSocket.off('message', this.onTrades);
        await this.tSocket.stop();
        await this.trades.stop();
    }
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
//# sourceMappingURL=public-api.js.map