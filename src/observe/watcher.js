import Dep from "./dep"

let id = 0

// 每个属性有一个 dep （属性就是被观察者），watcher就是观察者（属性变化了会同通知观察者来更新） ===> 观察者模式
class Watcher { //不同组件有不同的watcher 目前只有一个渲染根实例

    constructor(vm, fn, options) {
        this.id = id++
        this.renderWatcher = options // 是一个渲染Watchetr
        this.getter = fn //getter意味着 调用这个函数 可以发生取值操作
        this.deps = [] //让watcher记住dep，后续实现计算属性，和一些清理工作需要用到
        this.depsId = new Set()
        this.get()
    }

    get() { // 调用get方法就可以渲染视图
        Dep.target = this   //把当前的 watcher实例，放到 Dep的静态属性上。
        this.getter() //回去vm上取值
        Dep.target = null //取值完毕后清空
    }

    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            // watcher记住dep并进行去重
            dep.addSubs(this) //再调用dep的 addSubs记住watcher
        }
    }
    update() {
        // 对更新操作进行异步处理
        // this.get()
        queueWatcher(this) //把传入的watcher暂存起来
    }
    run() {
        this.get()
    }
}


let queue = []
let has = {}
let pending = false //防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    flushQueue.forEach(q => q.run())
    queue = []
    has = {}
    pending = false
}

function queueWatcher(watcher) {
    const id = watcher.id
    // 对同一个页面的多次改变去重
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true;
        // 不管执行多少次数据的变化,但最终只执行一轮刷新操作，放到一起更新
        if (!pending) {
            setTimeout(flushSchedulerQueue, 0);
            pending = true
        }
    }
}



// 需要给每一个属性增加一个 dep， 目的就是为了收集 Watcher
// 让属性收集他所依赖的watcher

// 一个视图有多个属性, 一个watcher 对应多个 dep ，一个dep 也可以对应多个视图。
// 多对多的关系

export default Watcher