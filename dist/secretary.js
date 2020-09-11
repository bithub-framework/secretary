import Startable from 'startable';
import { readJsonSync } from 'fs-extra';
import { resolve } from 'path';
import WebSocket from 'ws';
import { once } from 'events';
import Context from './context';
import config from './config';
class Secretary extends Startable {
    constructor() {
        super();
        this.publicSockets = {};
        this.instanceConfig = readJsonSync(process.argv[3]);
        this.ctx = new Context(this.instanceConfig);
    }
    async _start() {
        await this.connectPublicCenter();
        await this.startStrategy();
    }
    async _stop() {
        if (this.strategy)
            await this.strategy.stop();
        await this.ctx.stop();
    }
    async connectPublicCenter() {
        for (const [mid, { exchange, pair, }] of this.instanceConfig.markets.entries()) {
            const marketName = `${exchange}/${pair}`;
            const oSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/orderbook`);
            oSocket.on('message', (message) => {
                oSocket.emit('data', JSON.parse(message));
            });
            await once(oSocket, 'open');
            const tSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/trades`);
            tSocket.on('message', (message) => {
                tSocket.emit('data', JSON.parse(message));
            });
            await once(tSocket, 'open');
            this.publicSockets[mid] = {
                trades: tSocket,
                orderbook: oSocket,
            };
        }
    }
    async startStrategy() {
        const Strategy = await import(resolve(process.cwd(), process.argv[3], this.instanceConfig.strategyPath));
        this.strategy = new Strategy(this.ctx);
        await this.strategy.start(err => void this.stop(err));
    }
}
export default Secretary;
export { Secretary };
//# sourceMappingURL=secretary.js.map