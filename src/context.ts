import Startable from 'startable';
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import Bluebird from 'bluebird';
import {
    Config,
    ContextAccountLike,
    ContextMarketLike,
    ContextLike,
} from './interfaces';

class Context extends Startable implements ContextLike {
    [marketId: number]: ContextMarket;
    public sleep = Bluebird.delay;

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
}


class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;

    constructor(
        config: Config,
        mid: number,
    ) {
        super(config, mid);
        for (const aid of config.markets[mid].accounts.keys()) {
            this[aid] = new ContextAccount(config, mid, aid);
        }
    }
}

class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike { }

export {
    Context as default,
    Context,
}
