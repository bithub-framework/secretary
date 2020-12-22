import { reviver, } from './interfaces';
import Startable from 'startable';
import PWebSocket from 'promisified-websocket';
class ContextMarketPublicApi extends Startable {
    constructor(instanceConfig, mid) {
        super();
        this.onOrderbook = (message) => {
            try {
                const orderbook = JSON.parse(message, reviver);
                this.emit('orderbook', orderbook);
            }
            catch (err) {
                this.stop().catch(() => { });
            }
        };
        this.onTrades = (message) => {
            try {
                const trades = JSON.parse(message, reviver);
                this.emit('trades', trades);
            }
            catch (err) {
                this.stop().catch(() => { });
            }
        };
        const marketConfig = instanceConfig.markets[mid];
        this.oSocket = new PWebSocket(marketConfig.ORDERBOOK_URL);
        this.tSocket = new PWebSocket(marketConfig.TRADES_URL);
    }
    async _start() {
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
    }
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
//# sourceMappingURL=public-api.js.map