"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
// 没状态的程序用函数式比较方便一点。
function makeContextAccessor(instanceConfig, publicSockets, privateSockets, publicData, privateRequests) {
    function makeMarketAccessor(marketId) {
        function makeAccountAccessor(accountId) {
            const accountAccessor = function () {
                return contextAccount;
            };
            const contextAccount = new Proxy({}, {
                get: function (target, field, receiver) {
                    let member;
                    if (member === undefined) {
                        member = Reflect.get(privateRequests, field, privateRequests);
                        if (member)
                            member
                                = (...args) => member(marketId, accountId, ...args);
                    }
                    if (member === undefined) {
                        member = Reflect.get(privateSockets[marketId][accountId], field, privateSockets[marketId][accountId]);
                    }
                    return member;
                }
            });
            return accountAccessor;
        }
        const contextMarketAccessor = function () {
            return contextMarket;
        };
        const publicEvents = new events_1.default();
        publicSockets[marketId].orderbook.on('data', (data) => {
            publicEvents.emit('orderbook', data);
        });
        publicSockets[marketId].trades.on('data', (data) => {
            publicEvents.emit('trades', data);
        });
        const { accounts } = instanceConfig.markets[marketId];
        for (const accountId of accounts) {
            contextMarketAccessor[accountId] = makeAccountAccessor(accountId);
        }
        const mainAccountId = instanceConfig.markets[mainMarketId].accounts[0];
        const contextMarket = new Proxy({}, {
            get: function (target, field, receiver) {
                let member;
                if (member === undefined)
                    member = Reflect.get(publicData, field, publicData);
                if (member === undefined)
                    member = Reflect.get(publicEvents, field, publicEvents);
                if (member === undefined) {
                    const contextMainAccount = contextMarketAccessor[mainAccountId]();
                    member = Reflect.get(contextMainAccount, field, contextMainAccount);
                }
                return member;
            }
        });
        return contextMarketAccessor;
    }
    const contextAccessor = function () {
        return context;
    };
    const marketIds = Object.keys(instanceConfig.markets);
    for (const marketId of marketIds)
        contextAccessor[marketId] = makeMarketAccessor(marketId);
    const mainMarketId = Object.keys(instanceConfig.markets)[0];
    const context = new Proxy({}, {
        get: function (target, field, receiver) {
            const contextMainMarket = contextAccessor[mainMarketId]();
            const member = Reflect.get(contextMainMarket, field, contextMainMarket);
            return member;
        }
    });
    return contextAccessor;
}
exports.makeContextAccessor = makeContextAccessor;
exports.default = makeContextAccessor;
//# sourceMappingURL=context.js.map