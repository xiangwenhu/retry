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
            if (r >= 0) {
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
        log("onError:", error);
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


