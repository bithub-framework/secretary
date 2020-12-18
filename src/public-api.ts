import {
    ContextMarketPublicApiLike,
    Orderbook,
    Trade,
    Config,
} from './interfaces';
import Startable from 'startable';
import PWebSocket from 'promisified-websocket';

class ContextMarketPublicApi extends Startable implements ContextMarketPublicApiLike {
    private oSocket: PWebSocket;
    private tSocket: PWebSocket;

    constructor(
        instanceConfig: Config,
        mid: number,
    ) {
        super();
        const marketConfig = instanceConfig.markets[mid];
        this.oSocket = new PWebSocket(marketConfig.ORDERBOOK_URL);
        this.tSocket = new PWebSocket(marketConfig.TRADES_URL)
    }

    protected async _start() {
        await this.oSocket.start(err => void this.stop(err).catch(() => { }));
        this.oSocket.on('message', this.onOrderbook);
        await this.tSocket.start(err => void this.stop(err).catch(() => { }));
        this.tSocket.on('message', this.onTrades);
    }

    protected async _stop() {
        this.oSocket.off('message', this.onOrderbook);
        await this.oSocket.stop();
        this.tSocket.off('message', this.onTrades);
        await this.tSocket.stop();
    }

    private onOrderbook = (message: string) => {
        try {
            const orderbook = <Orderbook>JSON.parse(message);
            this.emit('orderbook', orderbook);
        } catch (err) {
            this.stop().catch(() => { });
        }
    };

    private onTrades = (message: string) => {
        try {
            const trades = <Trade[]>JSON.parse(message);
            this.emit('trades', trades);
        } catch (err) {
            this.stop().catch(() => { });
        }
    };
}

export {
    ContextMarketPublicApi as default,
    ContextMarketPublicApi,
}
