## 重试任务，支撑同步任务和异步任务
* RetryAsyncTask 
* RetryTask

示例方法和属性
* 


## 重试同步任务
代码示例
```ts
import RetryTask from "../RetryTask";

interface IContext {
    taskName: string;
}

const taskFun = function(this: IContext){
    const r = Math.random();
    if (r >= 0.5) {
        throw new Error(`${this.taskName} error, value greater than 0.5`);
    }
    return r;
}

const rTask = new RetryTask({
    context: {
        taskName: "randomFun"
    },
    args: []
});
rTask
    .onRetry((attemptTimes, error) => {
        console.log("onRetry:", attemptTimes, error);
    })
    .onComplete((attemptTimes, res) => {
        console.log("onComplete:", attemptTimes, res);
    })
    .onError((error) => {
        console.log("error:", error);
    })
    .startPromise(taskFun, {
        retries: 3
    }).then(res => {
        console.log("res:", res);
    }).catch(err => {
        console.error("error:", err);
    });

```
结果示例
```js
onRetry: 1 Error: randomFun error, value greater than 0.5
    at Object.taskFun (d:\projects\github-my\retry-main\src\test\RetryTask.ts:11:15)
    at RetryTask.attempt (d:\projects\github-my\retry-main\src\RetryTask.ts:92:37)
    at RetryTask.start (d:\projects\github-my\retry-main\src\RetryTask.ts:57:14)
    at d:\projects\github-my\retry-main\src\RetryTask.ts:70:18
    at new Promise (<anonymous>)
    at RetryTask.startPromise (d:\projects\github-my\retry-main\src\RetryTask.ts:61:16)
    at Object.<anonymous> (d:\projects\github-my\retry-main\src\test\RetryTask.ts:32:6)
    at Module._compile (node:internal/modules/cjs/loader:1103:14)
    at Module.m._compile (C:\Users\xiang\AppData\Roaming\npm\node_modules\ts-node\src\index.ts:1455:23)
    at Module._extensions..js (node:internal/modules/cjs/loader:1157:10)
onComplete: 2 0.1796133290158295
res: { attemptTimes: 2, data: 0.1796133290158295 }
```


## 重试异步任务

代码示例
```ts
import RetryAsyncTask from "../RetryAsyncTask";

interface IContext {
    taskName: string;
}

const log = (...args: any[]) => {
    console.log(`${new Date().toLocaleTimeString()}`, ...args);
};

const taskFun = function (this: IContext) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const r = Math.random();
            if (r >= 0.5) {
                return reject(
                    new Error(`${this.taskName} error, value greater than 0.5`)
                );
            }
            return resolve(r);
        }, 1000);
    });
};

const rTask = new RetryAsyncTask({
    context: {
        taskName: "randomFun",
    },
    args: [],
    minTimeout: 1000,
    maxTimeout: 1000
});
rTask
    .onRetry((attemptTimes, error) => {
        log("onRetry:", attemptTimes, error);
    })
    .onComplete((attemptTimes, res) => {
        log("onComplete:", attemptTimes, res);
    })
    .onError((error) => {
        log("error:", error);
    })
    .startPromise(taskFun, {
        retries: 3,
    })
    .then((res) => {
        log("res:", res);
    })
    .catch((err) => {
        log("error:", err);
    });

```


结果示例
```js
23:43:59 onRetry: 1 Error: randomFun error, value greater than 0.5
    at Timeout._onTimeout (d:\projects\github-my\retry-main\src\test\RetryAsyncTask.ts:17:21)
    at listOnTimeout (node:internal/timers:559:17)
    at processTimers (node:internal/timers:502:7)
23:44:01 onComplete: 2 0.4114540996627256
23:44:01 res: { attemptTimes: 2, data: 0.4114540996627256 }

```



## 参考
https://github.com/tim-kos/node-retry   
https://github.com/vercel/async-retry
