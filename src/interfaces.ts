export * from 'interfaces';

import { StartableLike } from 'startable';
import {
    ContextLike,
    MarketSpec,
    AccountSpec,
} from 'interfaces';

interface AccountConfig extends AccountSpec {
    URL: string;
}

interface MarketConfig extends MarketSpec {
    ORDERBOOK_URL: string;
    TRADES_URL: string;
    accounts: AccountConfig[];
}

export interface Config {
    markets: MarketConfig[],
}

export interface StrategyConstructor {
    new(context: ContextLike): StartableLike;
}
