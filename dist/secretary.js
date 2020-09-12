import Startable from 'startable';
import { readJsonSync } from 'fs-extra';
import { resolve, dirname } from 'path';
import WebSocket from 'ws';
import { once } from 'events';
import Context from './context';
import PrivateRequests from './private-requests';
class Secretary extends Startable {
    constructor() {
        super();
        this.publicSockets = {};
        this.instanceConfig = readJsonSync(process.argv[3]);
        this.ctx = new Context(this.instanceConfig, new PrivateRequests(this.instanceConfig));
    }
    async _start() {
        await this.ctx.start(err => void this.stop(err));
        await this.connectPublicAgents();
        await this.startStrategy();
    }
    async _stop() {
        if (this.strategy)
            await this.strategy.stop();
        await this.disconnectPublicAgents();
        await this.ctx.stop();
    }
    async connectPublicAgents() {
        for (const [mid, { orderbookUrl, tradesUrl },] of Object.entries(this.instanceConfig.markets)) {
            const oSocket = new WebSocket(orderbookUrl);
            oSocket.on('message', (message) => {
                const orderbook = JSON.parse(message);
                this.ctx[mid].orderbook = orderbook;
                this.ctx[mid].emit('orderbook', orderbook);
            });
            const tSocket = new WebSocket(tradesUrl);
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
    async disconnectPublicAgents() {
        for (const { trades: tSocket, orderbook: oSocket, } of Object.values(this.publicSockets)) {
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