import { Startable, StartableLike } from 'startable';
import Context from './context';
import {
    InstanceConfig,
    ContextLike,
} from './interfaces';

interface StrategyConstructor {
    new(context: ContextLike): StartableLike;
}

class Secretary extends Startable {
    private context: Context;
    private strategy: StartableLike;

    constructor(
        Strategy: StrategyConstructor,
        private instanceConfig: InstanceConfig,
    ) {
        super();
        this.context = new Context(this.instanceConfig);
        this.strategy = new Strategy(this.context);
    }

    protected async _start(): Promise<void> {
        await this.context.start(err => void this.stop(err).catch(() => { }));
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop(): Promise<void> {
        await this.strategy.stop();
        await this.context.stop();
    }
}

export {
    Secretary as default,
    Secretary,
};
