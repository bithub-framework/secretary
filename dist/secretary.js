import { Startable } from 'startable';
import Context from './context';
class Secretary extends Startable {
    constructor(Strategy, instanceConfig) {
        super();
        this.instanceConfig = instanceConfig;
        this.context = new Context(this.instanceConfig);
        this.strategy = new Strategy(this.context);
    }
    async _start() {
        await this.context.start(err => void this.stop(err).catch(() => { }));
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        await this.strategy.stop();
        await this.context.stop();
    }
}
export { Secretary as default, Secretary, };
//# sourceMappingURL=secretary.js.map