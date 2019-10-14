import Autonomous from 'autonomous';
import { readJson, readJsonSync } from 'fs-extra';
import { join } from 'path';
import WebSocket from 'ws';
import { once } from 'events';
import makeContextAccessor from './context';
import Queue from 'ttl-queue';
import PrivateRequests from './private-requests';
import {
    PublicSockets,
    PrivateSockets,
    InstanceConfig,
    Config,
    ContextAccessor,
    StrategyCtor,
    Strategy,
    Orderbook,
    Trade,
    PublicData,
} from './interfaces';

const config: Config = readJsonSync(join(__dirname, '../',
    `./cfg/config.json`));

const pathRegex = /^(\.?|(\.\.)?)\//;

class Secretary extends Autonomous {
    private instanceConfig!: InstanceConfig;
    private publicSockets: PublicSockets = {};
    private privateSockets: PrivateSockets = {};
    private ctx!: ContextAccessor;
    private strategy!: Strategy;
    private privateRequests = new PrivateRequests(config);
    private publicData: PublicData = {};


    constructor(private serviceCtx: any) {
        super();
    }

    protected async _start(): Promise<void> {
        await this.readInstanceConfig();
        this.ctx = makeContextAccessor(
            this.instanceConfig,
            this.publicSockets,
            this.privateSockets,
            this.publicData,
            this.privateRequests,
        );

        await this.configurePublicSockets();
        this.configurePublicData();

        await this.startStrategy();
    }

    protected async _stop(): Promise<void> {
        await this.strategy.stop();
    }

    private async readInstanceConfig(): Promise<void> {
        if (pathRegex.test(this.serviceCtx.appName))
            this.instanceConfig = await readJson(this.serviceCtx.appName)
        else this.instanceConfig = await readJson(join(
            __dirname,
            '../instances',
            `${this.serviceCtx.appName}.json`,
        ));
    }

    private async configurePublicSockets(): Promise<void> {
        for (const {
            exchange, pair, accounts,
        } of Object.values(this.instanceConfig.markets)) {
            const market = `${exchange}/${pair}`;

            const oSocket = this.publicSockets[market].orderbook
                = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${market}/orderbook`);
            oSocket.on('message', (message: string) => {
                oSocket.emit('data', JSON.parse(message));
            });
            await once(oSocket, 'open');

            const tSocket = this.publicSockets[market].trades
                = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${market}/trades`);
            tSocket.on('message', (message: string) => {
                tSocket.emit('data', JSON.parse(message));
            });
            await once(tSocket, 'open');

            for (const account of accounts) {
                const pSocket = this.privateSockets[market][account]
                    = new WebSocket(`${config.PUBLIC_CENTER_BASE_URL}/${market}/${account}`);
                await once(pSocket, 'open');
            }
        }
    }

    private configurePublicData(): void {
        for (const marketId in this.publicSockets) {
            this.publicData[marketId] = {
                orderbook: { asks: [], bids: [] },
                trades: new Queue<Trade>(config.TRADE_TTL),
            };

            const oSocket = this.publicSockets[marketId].orderbook;
            oSocket.on('data', (orderbook: Orderbook) => {
                this.publicData[marketId].orderbook = orderbook;
            });
            const tSocket = this.publicSockets[marketId].trades;
            tSocket.on('data', (trades: Trade[]) => {
                this.publicData[marketId].trades.push(...trades);
            });
        }
    }

    private async startStrategy(): Promise<void> {
        const Strategy: StrategyCtor = await import(join(
            __dirname,
            '../../../strategies/',
            this.instanceConfig.strategy,
        ));

        this.strategy = new Strategy(this.ctx);
        await this.strategy.start();
    }
}

export default Secretary;
export { Secretary };