"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const autonomous_1 = __importDefault(require("autonomous"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
const context_1 = __importDefault(require("./context"));
const ttl_queue_1 = __importDefault(require("ttl-queue"));
const private_requests_1 = __importDefault(require("./private-requests"));
const config = fs_extra_1.readJsonSync(path_1.join(__dirname, '../', `./cfg/config.json`));
const pathRegex = /^(\.?|(\.\.)?)\//;
class Secretary extends autonomous_1.default {
    constructor(serviceCtx) {
        super();
        this.serviceCtx = serviceCtx;
        this.publicSockets = {};
        this.privateSockets = {};
        this.privateRequests = new private_requests_1.default(config);
        this.publicData = {};
    }
    async _start() {
        await this.readInstanceConfig();
        this.ctx = context_1.default(this.instanceConfig, this.publicSockets, this.privateSockets, this.publicData, this.privateRequests);
        await this.configurePublicSockets();
        this.configurePublicData();
        await this.startStrategy();
    }
    async _stop() {
        await this.strategy.stop();
    }
    async readInstanceConfig() {
        if (pathRegex.test(this.serviceCtx.appName))
            this.instanceConfig = await fs_extra_1.readJson(this.serviceCtx.appName);
        else
            this.instanceConfig = await fs_extra_1.readJson(path_1.join(__dirname, '../instances', `${this.serviceCtx.appName}.json`));
    }
    async configurePublicSockets() {
        for (const { exchange, pair, accounts, } of Object.values(this.instanceConfig.markets)) {
            const market = `${exchange}/${pair}`;
            const oSocket = this.publicSockets[market].orderbook
                = new ws_1.default(`${config.PUBLIC_CENTER_BASE_URL}/${market}/orderbook`);
            oSocket.on('message', (message) => {
                oSocket.emit('data', JSON.parse(message));
            });
            await events_1.once(oSocket, 'open');
            const tSocket = this.publicSockets[market].trades
                = new ws_1.default(`${config.PUBLIC_CENTER_BASE_URL}/${market}/trades`);
            tSocket.on('message', (message) => {
                tSocket.emit('data', JSON.parse(message));
            });
            await events_1.once(tSocket, 'open');
            for (const account of accounts) {
                const pSocket = this.privateSockets[market][account]
                    = new ws_1.default(`${config.PUBLIC_CENTER_BASE_URL}/${market}/${account}`);
                await events_1.once(pSocket, 'open');
            }
        }
    }
    configurePublicData() {
        for (const marketId in this.publicSockets) {
            this.publicData[marketId] = {
                orderbook: { asks: [], bids: [] },
                trades: new ttl_queue_1.default(config.TRADE_TTL),
            };
            const oSocket = this.publicSockets[marketId].orderbook;
            oSocket.on('data', (orderbook) => {
                this.publicData[marketId].orderbook = orderbook;
            });
            const tSocket = this.publicSockets[marketId].trades;
            tSocket.on('data', (trades) => {
                this.publicData[marketId].trades.push(...trades);
            });
        }
    }
    async startStrategy() {
        const Strategy = await Promise.resolve().then(() => __importStar(require(path_1.join(__dirname, '../../../strategies/', this.instanceConfig.strategy))));
        this.strategy = new Strategy(this.ctx);
        await this.strategy.start();
    }
}
exports.Secretary = Secretary;
exports.default = Secretary;
//# sourceMappingURL=index.js.map