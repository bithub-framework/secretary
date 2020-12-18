export * from 'interfaces';
export interface Config {
    markets: {
        ORDERBOOK_URL: string;
        TRADES_URL: string;
        accounts: {
            URL: string;
        }[];
    }[];
}
