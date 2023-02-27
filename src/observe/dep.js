let id = 0
class Dep {
    constructor() {
        this.id = id++
        this.subs = []  //这里要存放 属性对应的watcher

    }
    depend() {
        // 这里我们不希望多次存放同一watcher、
        // this.subs.push(Dep.target)

        // 先调用watcher的  addDep , 让watcher记住 dep
        Dep.target.addDep(this)
        // 然后 watcher 调用dep的addSubs 让dep记住 watcher
    }
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

Dep.target = null

let stack = []
export function pushTarget(target) {
    Dep.target = target
    stack.push(target)
}

export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}






export default Dep





// 依赖手收集
// 1. 在进行挂载时，先new 一个Watcher。 并把 Dep.taget 指向自己。 然后去调用 _render _update
// 2. 在 _update 过程中，会去访问被监听的属性，每个属性都在initState时存了一个闭包的new Dep()
// 3. 被用到的 属性，进入被劫持的get函数时，读取到 Dep.target，就会进行dep和watch的绑定
// 4. 绑定过程 首先调用 dep.depend(), 这里会先让 watcher记住dep， 调用Dep.target.addDep(),在watch中进行去重。
// 5. 如果没有重复就接着让 dep记住watcher，调用dep.addSubs()，两边各自存放入自己的数组中，实现依赖收集