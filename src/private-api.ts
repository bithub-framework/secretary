import fetch from 'node-fetch';
import {
    LimitOrder,
    OpenOrder,
    Balances,
    Positions,
    OrderId,
    Config,
    ContextAccountApiLike,
    reviver,
    Amendment,
} from './interfaces';
import Big from 'big.js';
import { EventEmitter } from 'events';

// TODO: 序列化之前，写成 literal
class ContextAccountPrivateApi extends EventEmitter implements ContextAccountApiLike {
    private accountConfig: Config['markets'][0]['accounts'][0];

    constructor(
        config: Config,
        mid: number,
        aid: number,
    ) {
        super();
        this.accountConfig = config.markets[mid].accounts[aid];
    }

    public async makeLimitOrders(orders: LimitOrder[]): Promise<OrderId[]> {
        return fetch(
            `${this.accountConfig.URL}/orders`,
            {
                method: 'post',
                body: JSON.stringify(orders),
                headers: { 'Content-Type': 'application/json' },
            }
        ).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            return JSON.parse(await res.text(), reviver);
        });
    }

    public async amendLimitOrders(amendments: Amendment[]): Promise<Big[]> {
        return fetch(
            `${this.accountConfig.URL}/orders`,
            {
                method: 'put',
                body: JSON.stringify(amendments),
                headers: { 'Content-Type': 'application/json' },
            }
        ).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            return JSON.parse(await res.text(), reviver);
        });
    }

    public async cancelOrders(orders: OpenOrder[]): Promise<Big[]> {
        return fetch(
            `${this.accountConfig.URL}/orders`,
            {
                method: 'delete',
                body: JSON.stringify(orderIds),
                headers: { 'Content-Type': 'application/json' },
            }
        ).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            return JSON.parse(await res.text(), reviver);
        });
    }

    public async getOpenOrders(): Promise<OpenOrder[]> {
        return fetch(
            `${this.accountConfig.URL}/orders`,
        ).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            return JSON.parse(await res.text(), reviver);
        });
    }

    public async getPositions(): Promise<Positions> {
        return fetch(
            `${this.accountConfig.URL}/positions`,
        ).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            return JSON.parse(await res.text(), reviver);
        });
    }

    public async getBalances(): Promise<Balances> {
        return fetch(
            `${this.accountConfig.URL}/balances`,
        ).then(async res => {
            if (!res.ok) throw new Error(res.statusText);
            return JSON.parse(await res.text(), reviver);
        });
    }
}

export {
    ContextAccountPrivateApi as default,
    ContextAccountPrivateApi,
};
