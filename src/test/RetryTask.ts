import RetryTask from "../RetryTask";

const log = (...args: any[]) => {
    console.log(`${new Date().toLocaleTimeString()}`, ...args);
};

interface IContext {
    taskName: string;
}

const taskFun = function(this: IContext){
    const r = Math.random();
    if (r >= 0.1) {
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
    .onAttemptError((attemptTimes, error) => {
        log("onAttemptError:", attemptTimes, error);
    })
    .onComplete((attemptTimes, res) => {
        log("onComplete:", attemptTimes, res);
    })
    .onError((error) => {
        log("onError:", error);
    })
    .startPromise(taskFun, {
        attemptTimes: 3
    }).then(res => {
        log("res:", res);
    }).catch(err => {
        log("error:", err);
    });

