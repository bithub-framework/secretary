# SecretaryJS

SecretaryJS 是 BitHub 的组件，是你的策略下单和获取数据的接口。

## 特性

- 支持异步策略
- 支持事件触发式策略
- 非侵入式
- 支持同时获取多个交易所的数据，因此可用于套利策略。

### Drawbacks

- 只支持限价单

## 接口

你需要将你的策略写成这个接口

```ts
interface ServiceConstructor{
    new (context: ContextLike): Service;
}

interface Service {
    start(): Promise<void>;
    stop(): Promise<void>;
}
```

这个接口完全兼容阿里开源 node 进程管理器 [Pandora](https://github.com/midwayjs/pandora)。

### Context

由于本框架是非侵入式的，context 是你的策略与框架进行交互的唯一接口。

可能为十进制小数的数据使用高精度计算库 [big.js](https://github.com/MikeMcl/big.js/)。

```ts
import { Big } from 'big.js';

type Length = 1 /* for long position */ | -1 /* for short position */;
type Side = 1 /* for bidding */ | -1 /* for asking */;
type Operation = 1 /* for opening position */ | -1 /* for closing position */;

interface ContextLike {
    [marketId: number]: {
        [accountId: number]: {
            makeLimitOrder(order: LimitOrder): Promise<OrderId>;
            getOpenOrders(): Promise<OpenOrder[]>;
            cancelOrder(orderId: OrderId): Promise<void>;
            getAssets(): Promise<Assets>;
        };
        on(event: 'orderbook', listener: (orderbook: Orderbook) => void): this;
        on(event: 'trades', listener: (trades: Trade[]) => void): this;
        off(event: 'orderbook', listener: (orderbook: Orderbook) => void): this;
        off(event: 'trades', listener: (trades: Trade[]) => void): this;
        once(event: 'orderbook', listener: (orderbook: Orderbook) => void): this;
        once(event: 'trades', listener: (trades: Trade[]) => void): this;
    };
    sleep: (ms: number) => Promise<void>;
    now: () => number;
    escape: <T>(v: T) => Promise<T>;
}

interface LimitOrder {
    price: Big;
    quantity: Big;
    side: Side;
    length: Length;
    operation: Operation;
}

interface OpenOrder {
    price: Big;
    quantity: Big;
    side: Side;
    length: Length;
    operation: Operation;
    id: number | string;
}

interface Trade {
    side: Side;
    price: Big;
    quantity: Big;
    time: number;
    id: number | string;
}

interface Orderbook {
    [side: Side]: {
        price: Big;
        quantity: Big;
        side: Side,
    }[],
    time: number;
}

interface Assets {
    position: {
        [length: Length]: Big;
    };
    balance: Big;
    cost: {
        [length: Length]: Big;
    };
    frozenMargin: Big;
    frozenPosition: {
        [length: Length]: Big;
    };
    margin: Big;
    reserve: Big;
    closable: {
        [length: Length]: Big;
    };
}
```

用 TypeScript 的同学可以直接安装[接口](https://github.com/bithub-framework/interfaces)。

### 异步策略

如果你不打算回测的话，怎么写都行。如果你想回测，需要遵守回测框架 [Tecretary](https://github.com/bithub-framework/tecretary) 的规则，遵守回测规则的代码可以原封不动地直接在 SeretaryJS 使用。

## Widgets

工欲善其事，必先利其器。

- [Startable](https://github.com/zimtsui/startable) - 健壮的服务型对象框架
- [Pollerloop](https://github.com/zimtsui/pollerloop) - 优雅的异步循环
