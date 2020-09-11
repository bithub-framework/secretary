import { Startable, StartableLike } from 'startable';
import { readJsonSync } from 'fs-extra';
import { resolve, dirname } from 'path';
import WebSocket from 'ws';
import { once } from 'events';
import Context from './context';
import PrivateRequests from './private-requests';
import {
    InstanceConfig,
    Trade,
    Orderbook,
} from './interfaces';
import config from './config';



export type Strategy = StartableLike;

export interface StrategyCtor {
    new(ctx: Context): Strategy;
}

class Secretary extends Startable {
    private instanceConfig: InstanceConfig;
    private ctx: Context;
    private strategy?: Strategy;
    private publicSockets: {
        trades: WebSocket,
        orderbook: WebSocket,
    }[] = [];

    constructor() {
        super();
        this.instanceConfig = readJsonSync(process.argv[3]);
        this.ctx = new Context(
            this.instanceConfig,
            new PrivateRequests(),
        );
    }

    protected async _start(): Promise<void> {
        await this.ctx.start(err => void this.stop(err));
        await this.connectPublicCenter();
        await this.startStrategy();
    }

    protected async _stop(): Promise<void> {
        if (this.strategy) await this.strategy.stop();
        await this.disconnectPublicCenter();
        await this.ctx.stop();
    }

    private async connectPublicCenter(): Promise<void> {
        for (const [mid, {
            exchange, pair,
        }] of this.instanceConfig.markets.entries()) {
            const marketName = `${exchange}/${pair}`;

            const oSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/orderbook`);
            oSocket.on('message', (message: string) => {
                const orderbook = <Orderbook>JSON.parse(message);
                this.ctx[mid].orderbook = orderbook;
                this.ctx[mid].emit('orderbook', orderbook);
            });

            const tSocket = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${marketName}/trades`);
            tSocket.on('message', (message: string) => {
                const trades = <Trade[]>JSON.parse(message);
                trades.forEach(trade => void this.ctx[mid].trades.push(trade, trade.time));
                this.ctx[mid].emit('trades', trades);
            });

            this.publicSockets[mid] = {
                trades: tSocket,
                orderbook: oSocket,
            }
            await once(oSocket, 'open');
            await once(tSocket, 'open');
        }
    }

    private async disconnectPublicCenter(): Promise<void> {
        await Promise.all(this.publicSockets.reduce((promises, {
            trades: tSocket, orderbook: oSocket,
        }) => {
            if (tSocket.readyState !== WebSocket.CLOSED) {
                tSocket.close();
                promises.push(once(tSocket, 'close'))
            }
            if (oSocket.readyState !== WebSocket.CLOSED) {
                oSocket.close();
                promises.push(once(oSocket, 'close'));
            }
            return promises;
        }, <Promise<unknown>[]>[]));
    }

    private async startStrategy(): Promise<void> {
        const Strategy = <StrategyCtor>await import(resolve(
            process.cwd(),
            dirname(process.argv[3]),
            this.instanceConfig.strategyPath,
        ));

        this.strategy = new Strategy(this.ctx);
        await this.strategy.start(err => void this.stop(err));
    }
}

export default Secretary;
export { Secretary };
