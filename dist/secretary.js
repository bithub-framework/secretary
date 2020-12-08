import { Startable } from 'startable';
import Context from './context';
class Secretary extends Startable {
    constructor(strategy, instanceConfig) {
        super();
        this.strategy = strategy;
        this.instanceConfig = instanceConfig;
        this.ctx = new Context(this.instanceConfig);
    }
    async _start() {
        await this.ctx.start(err => void this.stop(err).catch(() => { }));
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        await this.strategy.stop();
        await this.ctx.stop();
    }
}
export { Secretary as default, Secretary, };
//# sourceMappingURL=secretary.js.map