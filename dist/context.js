import Startable from 'startable';
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
class Context extends Startable {
    constructor(config) {
        super();
        this.config = config;
        for (const mid of this.config.markets.keys()) {
            this[mid] = new ContextMarket(this.config, mid);
        }
    }
    async _start() {
        for (const mid of this.config.markets.keys())
            await this[mid].start(err => this.stop(err).catch(() => { }));
    }
    async _stop() {
        for (const mid of this.config.markets.keys())
            await this[mid].stop();
    }
    async next() { }
}
class ContextMarket extends ContextMarketPublicApi {
    constructor(config, mid) {
        super(config, mid);
        const marketConfig = config.markets[mid];
        for (const aid of marketConfig.accounts.keys()) {
            this[aid] = new ContextAccount(config, mid, aid);
        }
    }
}
class ContextAccount extends ContextAccountPrivateApi {
}
export { Context as default, Context, };
//# sourceMappingURL=context.js.map