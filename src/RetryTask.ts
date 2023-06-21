import EventEmitter from 'events';
import { CommonFunction, EventName, RetryOptions, TaskCompleteFun, TaskErrorFun, TaskRetryFun } from './types';
import { DEFAULT_OPTIONS } from './const';
import * as timeouts from "./util/timeouts"

class RetryTask extends EventEmitter {
    protected ticket: any;
    protected fn: Function | null = null;
    protected attemptTimes: number = 1;
    protected timeouts: number[] | null = [];
    protected oriTimeouts: number[] = [];
    protected isRunning: boolean = false;

    protected options: RetryOptions;

    constructor(options: RetryOptions = {}) {
        super();
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.timeouts = [];
        this.oriTimeouts = [];
    }

    reset() {
        this.ticket && clearTimeout(this.ticket);
        this.attemptTimes = 1;
        this.timeouts = [...this.oriTimeouts];
        this.isRunning = false;
        return this;
    }

    stop() {
        this.ticket && clearTimeout(this.ticket);
        this.isRunning = false;
        return this;
    }

    start(fn: Function, options: RetryOptions = {}) {
        this.prepareStart(fn, options);
        this.isRunning = true;
        this.attempt();
    }

    startPromise(fn: Function, options: RetryOptions = {}) {
        return new Promise((resolve, reject) => {
            const onComplete = function (attemptTimes: number, res: any) {
                resolve({ attemptTimes, data: res });
            }
            const onError = function (error: any) {
                reject(error);
            }
            this.once("complete", onComplete);
            this.once("error", onError);
            this.start(fn, options);
        })
    }

    protected prepareStart(fn: Function, options: RetryOptions = {}) {
        if (this.isRunning) {
            return;
        }
        this.options = Object.assign({}, DEFAULT_OPTIONS, this.options, options);
        this.timeouts = timeouts.createTimeoutTimes(this.options);
        this.oriTimeouts = this.timeouts;
        this.fn = fn;
    }

    attempt() {
        try {
            const { context, args } = this.options;
            const result = this.fn!.apply(context, args);
            this._onComplete(result);
        } catch (err) {
            this.retry(err);
        }
    }

    protected retry(err: any) {
        const timeout = this.timeouts?.shift();
        if (timeout == undefined) {
            this._onError(new Error(`超过最大尝试次数:${this.options.retries}`))
            return;
        }
        this._onRetry(err);
        this.ticket = setTimeout(() => {
            this.attemptTimes++;
            this.attempt();
        }, timeout);
    }

    onRetry(fn: TaskRetryFun) {
        this._on("retry", fn);
        return this;
    }

    onComplete<R>(fn: TaskCompleteFun<R>) {
        this._on("complete", fn);
        return this;
    }

    onError(fn: TaskErrorFun) {
        this._on("error", fn);
        return this;
    }

    _on(evName: EventName, fn: CommonFunction) {
        this.on(evName, fn);
    }

    protected _onComplete(res: any) {
        this.isRunning = false;
        this.emit('complete', this.attemptTimes, res);
    }

    protected _onRetry(error: any) {
        this.emit('retry', this.attemptTimes, error);
    }

    protected _onError(error: any) {
        this.emit('error', error);
    }

}

export default RetryTask;