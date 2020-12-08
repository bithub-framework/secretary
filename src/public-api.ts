import {
    ContextMarketPublicApiLike,
    Orderbook,
    Trade,
    InstanceConfig,
} from './interfaces';
import TtlQueue from 'ttl-queue';
import Startable from 'startable';
import secretaryConfig from './config';
import PWebSocket from 'promisified-websocket';

class ContextMarketPublicApi extends Startable implements ContextMarketPublicApiLike {
    public orderbook: Orderbook;
    public trades: TtlQueue<Trade>;
    private oSocket: PWebSocket;
    private tSocket: PWebSocket;

    constructor(
        instanceConfig: InstanceConfig,
        mid: number,
    ) {
        super();

        this.trades = new TtlQueue<Trade>({
            ttl: instanceConfig.TRADE_TTL,
            cleaningInterval: secretaryConfig.CLEANING_INTERVAL,
        });
        this.orderbook = {
            asks: [], bids: [], time: Number.NEGATIVE_INFINITY,
        }
        const marketConfig = instanceConfig.markets[mid];
        this.oSocket = new PWebSocket(marketConfig.ORDERBOOK_URL);
        this.tSocket = new PWebSocket(marketConfig.TRADES_URL)
    }

    protected async _start() {
        await this.trades.start(err => void this.stop(err).catch(() => { }));
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
        await this.trades.stop();
    }

    private onOrderbook = (message: string) => {
        try {
            const orderbook = <Orderbook>JSON.parse(message);
            this.orderbook = orderbook;
            this.emit('orderbook', orderbook);
        } catch (err) {
            this.stop().catch(() => { });
        }
    };

    private onTrades = (message: string) => {
        try {
            const trades = <Trade[]>JSON.parse(message);
            trades.forEach(trade => void this.trades.push(trade, trade.time));
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
