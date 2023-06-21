import RetryTask from "../RetryTask";


const taskFun = () => {
    const r = Math.random();
    if (r >= 0.5) {
        throw new Error("greater than 0.5")
    }
    return r;
}

const rTask = new RetryTask();
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
    })