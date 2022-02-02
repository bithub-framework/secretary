import { Startable } from 'startable';
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import Bluebird from 'bluebird';
import {
    Config,
    ContextAccountLike,
    ContextMarketLike,
    ContextLike,
} from './interfaces';
import Big from 'big.js';

class Context extends Startable implements ContextLike {
    [marketId: number]: ContextMarket;
    public sleep = (ms: number) => Bluebird.delay(ms);
    public now = () => Date.now();
    public setTimeout: (cb: () => void, ms: number) => any = global.setTimeout;
    public clearTimeout: (timerId: any) => void = global.clearTimeout;;
    public now: () => number = Date.now;
    public escape: <T>(v: Promise<T>) => Promise<T> = v => v;

    constructor(
        private config: Config,

    ) {
        super();
        for (const mid of this.config.markets.keys()) {
            this[mid] = new ContextMarket(this.config, mid);
        }
    }

    protected async _start() {
        for (const mid of this.config.markets.keys())
            await this[mid].start(err => this.stop(err).catch(() => { }));
    }

    protected async _stop() {
        for (const mid of this.config.markets.keys())
            await this[mid].stop();
    }

    public async submit(key: string, value: unknown) {

    }
}


class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;
    public PRICE_DP: number;
    public QUANTITY_DP: number;
    public CURRENCY_DP: number;
    public TICK_SIZE: Big;
    public calcDollarVolume: (price: Big, quantity: Big) => Big;
    public calcQuantity: (price: Big, dollarVolume: Big) => Big;

    constructor(
        config: Config,
        mid: number,
    ) {
        super(config, mid);
        ({
            PRICE_DP: this.PRICE_DP,
            QUANTITY_DP: this.QUANTITY_DP,
            CURRENCY_DP: this.CURRENCY_DP,
            TICK_SIZE: this.TICK_SIZE,
            calcDollarVolume: this.calcDollarVolume,
            calcQuantity: this.calcQuantity,
        } = config.markets[mid]);
        for (const aid of config.markets[mid].accounts.keys()) {
            this[aid] = new ContextAccount(config, mid, aid);
        }
    }
}

class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike {
    public LEVERAGE: number;
    public MAKER_FEE_RATE: number;
    public TAKER_FEE_RATE: number;
    public ONE_WAY_POSITION: boolean;

    constructor(
        config: Config,
        mid: number,
        aid: number,
    ) {
        super(config, mid, aid);
        ({
            ONE_WAY_POSITION: this.ONE_WAY_POSITION,
            LEVERAGE: this.LEVERAGE,
            MAKER_FEE_RATE: this.MAKER_FEE_RATE,
            TAKER_FEE_RATE: this.TAKER_FEE_RATE,
        } = config.markets[mid].accounts[aid]);
    }
}

export {
    Context as default,
    Context,
}
