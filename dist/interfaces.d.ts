export * from 'interfaces';
import { StartableLike } from 'startable';
import { ContextLike } from 'interfaces';
export interface Config {
    markets: {
        ORDERBOOK_URL: string;
        TRADES_URL: string;
        accounts: {
            URL: string;
        }[];
    }[];
}
export interface StrategyConstructor {
    new (context: ContextLike): StartableLike;
}
