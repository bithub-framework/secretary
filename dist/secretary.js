import { Startable } from 'startable';
import { readJsonSync } from 'fs-extra';
import { resolve, dirname } from 'path';
import WebSocket from 'ws';
import { once } from 'events';
import Context from './context';
import PrivateRequests from './private-requests';
import config from './config';
class Secretary extends Startable {
    constructor() {
        super();
        this.publicSockets = [];
        this.instanceConfig = readJsonSync(process.argv[3]);
        this.ctx = new Context(this.instanceConfig, new PrivateRequests());
    }
    async _start() {
        await this.ctx.start(err => void this.stop(err));
        await this.connectPublicCenter();
        await this.startStrategy();
    }
    async _stop() {
        if (this.strategy)
            await this.strategy.stop();
        await this.disconnectPublicCenter();
        await this.ctx.stop();
    }
    async connectPublicCenter() {
        for (const [mid, { exchange, pair, }] of this.instanceConfig.markets.entries()) {
            const marketName = `${exchange}/${pair}`;
            const oSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/orderbook`);
            oSocket.on('message', (message) => {
                const orderbook = JSON.parse(message);
                this.ctx[mid].orderbook = orderbook;
                this.ctx[mid].emit('orderbook', orderbook);
            });
            const tSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/trades`);
            tSocket.on('message', (message) => {
                const trades = JSON.parse(message);
                trades.forEach(trade => void this.ctx[mid].trades.push(trade, trade.time));
                this.ctx[mid].emit('trades', trades);
            });
            this.publicSockets[mid] = {
                trades: tSocket,
                orderbook: oSocket,
            };
            await once(oSocket, 'open');
            await once(tSocket, 'open');
        }
    }
    async disconnectPublicCenter() {
        for (const sockets of this.publicSockets) {
            if (!sockets)
                continue;
            const { trades: tSocket, orderbook: oSocket } = sockets;
            // TODO: WebSocket.CONNECTING
            if (tSocket.readyState !== WebSocket.CLOSED) {
                tSocket.close();
                await once(tSocket, 'close');
            }
            if (oSocket.readyState !== WebSocket.CLOSED) {
                oSocket.close();
                await once(oSocket, 'close');
            }
        }
    }
    async startStrategy() {
        const Strategy = await import(resolve(process.cwd(), dirname(process.argv[3]), this.instanceConfig.strategyPath));
        this.strategy = new Strategy(this.ctx);
        await this.strategy.start(err => void this.stop(err));
    }
}
export default Secretary;
export { Secretary };
//# sourceMappingURL=secretary.js.map