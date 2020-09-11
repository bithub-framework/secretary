import Startable from 'startable';
import { readJsonSync } from 'fs-extra';
import { resolve } from 'path';
import WebSocket from 'ws';
import { once } from 'events';
import Context from './context';
import {
    PublicSockets,
    InstanceConfig,
    StrategyCtor,
    Strategy,
} from './interfaces';
import config from './config';

class Secretary extends Startable {
    private instanceConfig: InstanceConfig;
    private publicSockets: PublicSockets = {};
    private ctx: Context;
    private strategy?: Strategy;

    constructor() {
        super();
        this.instanceConfig = readJsonSync(process.argv[3]);
        this.ctx = new Context(this.instanceConfig);
    }

    protected async _start(): Promise<void> {
        await this.connectPublicCenter();
        await this.startStrategy();
    }

    protected async _stop(): Promise<void> {
        if (this.strategy) await this.strategy.stop();
        await this.ctx.stop();
    }

    private async connectPublicCenter(): Promise<void> {
        for (const [mid, {
            exchange, pair,
        }] of this.instanceConfig.markets.entries()) {
            const marketName = `${exchange}/${pair}`;

            const oSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/orderbook`);
            oSocket.on('message', (message: string) => {
                oSocket.emit('data', JSON.parse(message));
            });
            await once(oSocket, 'open');

            const tSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/trades`);
            tSocket.on('message', (message: string) => {
                tSocket.emit('data', JSON.parse(message));
            });
            await once(tSocket, 'open');

            this.publicSockets[mid] = {
                trades: tSocket,
                orderbook: oSocket,
            };
        }
    }

    private async startStrategy(): Promise<void> {
        const Strategy = <StrategyCtor>await import(resolve(
            process.cwd(),
            process.argv[3],
            this.instanceConfig.strategyPath,
        ));

        this.strategy = new Strategy(this.ctx);
        await this.strategy.start(err => void this.stop(err));
    }
}

export default Secretary;
export { Secretary };
