import { Startable, StartableLike } from 'startable';
import Context from './context';

import {
    InstanceConfig,
} from './interfaces';

class Secretary extends Startable {
    private ctx: Context;

    constructor(
        private strategy: StartableLike,
        private instanceConfig: InstanceConfig,
    ) {
        super();
        this.ctx = new Context(this.instanceConfig);
    }

    protected async _start(): Promise<void> {
        await this.ctx.start(err => void this.stop(err).catch(() => { }));
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop(): Promise<void> {
        await this.strategy.stop();
        await this.ctx.stop();
    }
}

export {
    Secretary as default,
    Secretary,
};
