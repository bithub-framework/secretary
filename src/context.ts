import EventEmitter from 'events';
import {
    ContextAccessor,
    Context,

    ContextMarketAccessor,
    ContextMarket,

    ContextAccountAccessor,
    ContextAccount,

    PublicSockets,
    PrivateSockets,
    PublicData,
    PrivateRequests,

    InstanceConfig,
    Orderbook,
    Trade,
} from './interfaces';

// 没状态的程序用函数式比较方便一点。

function makeContextAccessor(
    instanceConfig: InstanceConfig,
    publicSockets: PublicSockets,
    privateSockets: PrivateSockets,
    publicData: PublicData,
    privateRequests: PrivateRequests,
): ContextAccessor {
    function makeMarketAccessor(marketId: string): ContextMarketAccessor {
        function makeAccountAccessor(accountId: string): ContextAccountAccessor {
            const accountAccessor = <ContextAccountAccessor>function () {
                return contextAccount;
            }

            const contextAccount = new Proxy(<ContextAccount>{}, {
                get: function (target, field, receiver) {
                    let member: unknown;

                    if (member === undefined) {
                        member = Reflect.get(
                            privateRequests,
                            field,
                            privateRequests,
                        );
                        if (member) member
                            = (...args: unknown[]) => (<Function>member)(
                                marketId,
                                accountId,
                                ...args,
                            );
                    }
                    if (member === undefined) {
                        member = Reflect.get(
                            privateSockets[marketId][accountId],
                            field,
                            privateSockets[marketId][accountId],
                        );
                    }

                    return member;
                }
            });

            return accountAccessor;
        }

        const contextMarketAccessor = <ContextMarketAccessor>function () {
            return contextMarket;
        }

        const publicEvents = new EventEmitter();
        publicSockets[marketId].orderbook.on('data', (data: Orderbook) => {
            publicEvents.emit('orderbook', data);
        });
        publicSockets[marketId].trades.on('data', (data: Trade[]) => {
            publicEvents.emit('trades', data);
        });

        const { accounts } = instanceConfig.markets[marketId];
        for (const accountId of accounts) {
            contextMarketAccessor[accountId] = makeAccountAccessor(accountId);
        }

        const mainAccountId = instanceConfig.markets[mainMarketId].accounts[0];
        const contextMarket = new Proxy(
            <ContextMarket>{}, {
            get: function (target, field, receiver) {
                let member: unknown;

                if (member === undefined)
                    member = Reflect.get(
                        publicData,
                        field,
                        publicData,
                    );
                if (member === undefined)
                    member = Reflect.get(
                        publicEvents,
                        field,
                        publicEvents,
                    );
                if (member === undefined) {
                    const contextMainAccount = contextMarketAccessor[mainAccountId]();
                    member = Reflect.get(
                        contextMainAccount,
                        field,
                        contextMainAccount,
                    );
                }

                return member;
            }
        });

        return contextMarketAccessor;
    }

    const contextAccessor = <ContextAccessor>function () {
        return context;
    }

    const marketIds = Object.keys(instanceConfig.markets);
    for (const marketId of marketIds)
        contextAccessor[marketId] = makeMarketAccessor(marketId);

    const mainMarketId = Object.keys(instanceConfig.markets)[0];
    const context = new Proxy(<Context>{}, {
        get: function (target, field, receiver) {
            const contextMainMarket = contextAccessor[mainMarketId]();
            const member = Reflect.get(
                contextMainMarket,
                field,
                contextMainMarket,
            );
            return member;
        }
    });

    return contextAccessor;

}

export default makeContextAccessor;
export { makeContextAccessor };