export * from 'interfaces';
export interface InstanceConfig {
    markets: {
        ORDERBOOK_URL: string;
        TRADES_URL: string;
        accounts: {
            URL: string;
        }[];
    }[];
    TRADE_TTL: number;
}
