import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

// 每个属性有一个 dep （属性就是被观察者），watcher就是观察者（属性变化了会同通知观察者来更新） ===> 观察者模式
class Watcher {
    //不同组件有不同的watcher 目前只有一个渲染根实例

    constructor(vm, exprOrFn, options, cb) {
        // option 有三种  直接为true：标识这是渲染watcher
        //               {lazy: true} 标识是一个计算属性watcher。exprOrFn 是得到值的函数 是计算属性的get函数
        //               {user: true} 标识这是一个 监听属性的watcher，他会有第四个参数 cb，属性变化时的回调
        this.id = id++;
        this.vm = vm;

        if (typeof exprOrFn === "string") {
            //使用watch监听属性时这里会是字符串
            this.getter = function () {
                return vm[exprOrFn]; // 这里取值会进行依赖收集
            };
        } else {
            this.getter = exprOrFn; //getter意味着 调用这个函数 可以发生取值操作
        }

        this.renderWatcher = options; // 是否是一个渲染Watchetr
        this.deps = []; //让watcher记住dep，后续实现计算属性，和一些清理工作需要用到
        this.depsId = new Set();
        this.lazy = options.lazy; //控制是否不立即执行get, 用于computed
        this.dirty = this.lazy; //缓存值 初始值为ture / undefined

        // 如果是lazy就不取值，否则就去调用get() 用在computed计算缓存 和 渲染watch时执行
        this.value = this.lazy ? undefined : this.get();

        this.user = options.user; // 用来判断是否是 watch监听属性的 watcher
        this.cb = cb;
    }

    // 对监听属性的求值
    evaluate() {
        this.value = this.get();
        this.dirty = false;
    }

    get() {
        // 渲染watch调用get方法就可以渲染视图
        //
        pushTarget(this); //把当前的 watcher实例，放到 Dep的静态属性上。
        let value = this.getter.call(this.vm); //回去vm上取值
        popTarget(); //取值完毕后清空
        return value;
    }

    addDep(dep) {
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            // watcher记住dep并进行去重
            dep.addSubs(this); //再调用dep的 addSubs记住watcher
        }
    }
    depend() {
        //在这里取出 deps 遍历去 depend 当前的Dep.target
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();
        }
    }

    // dep.notify 会掉用相关的 watch.update进行数据更新
    update() {
        if (this.lazy) {
            // 如果是计算属性， 依赖变化了触发notice，就把脏值标识为 true 再次求值
            this.dirty = true;
        } else {
            // 对更新操作进行异步处理
            // this.get()
            queueWatcher(this); //把传入的watcher暂存起来
        }
    }

    run() {
        let oldValue = this.value;
        let newValue = this.get();
        // 如果是 watch 属性的话，还会执行相应的回调
        if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
        }
    }
}

// 异步批处理
let queue = [];
let has = {};
let pending = false; //防抖

// 对存储的 watcher 进行遍历更新
function flushSchedulerQueue() {
    let flushQueue = queue.slice(0); //把queue里面的1 watch 都拿出来 挨个调用run
    flushQueue.forEach((q) => q.run());
    queue = [];
    has = {};
    pending = false;
}

function queueWatcher(watcher) {
    const id = watcher.id;
    // 对同一个页面的多次改变去重
    if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        // 不管执行多少次数据的变化,但最终只执行一轮刷新操作，放到一起更新
        if (!pending) {
            nextTick(flushSchedulerQueue, 0);
            pending = true;
        }
    }
}

// 异步批处理
let callbacks = [];
let waiting = false;
function flushCallbacks() {
    waiting = false;
    let cbs = callbacks.slice(0);
    cbs.forEach((cb) => cb()); // 遍历执行所有的 nextTick回调
    callbacks = [];
}

// nextTick中没有直接使用哪个 api ，而是采用优雅降级的方法
// 内部采用的是 promise > MutationObserver(h5的api) > (ie专享的)setImmediate > (宏任务)setTimeout
// 如下
let timmerFunc;
if (Promise) {
    timmerFunc = () => {
        Promise.resolve().then(flushCallbacks);
    };
} else if (MutationObserver) {
    // 通过函数改变 监听元素的值 从而达到触发回调的功能
    let observer = new MutationObserver(flushCallbacks); //这里传入的回调时异步执行的
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    });
    timmerFunc = () => {
        textNode.textContent = 2;
    };
} else if (setImmediate) {
    timmerFunc = () => {
        setImmediate(flushCallbacks);
    };
} else {
    timmerFunc = () => {
        setTimeout(flushCallbacks, 0);
    };
}

// 用 nextTick将任务存到一个异步队列中
export function nextTick(cb) {
    callbacks.push(cb); //维护 nextTick中的 callback数组，最后一起 执行
    if (!waiting) {
        // setTimeout(() => {
        //     flushCallbacks()
        // }, 0)
        timmerFunc();
        waiting = true;
    }
}

// 需要给每一个属性增加一个 dep， 目的就是为了收集 Watcher
// 让属性收集他所依赖的watcher

// 一个视图有多个属性, 一个watcher 对应多个 dep ，一个dep 也可以对应多个视图。
// 多对多的关系

export default Watcher;
