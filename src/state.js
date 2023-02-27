import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data //data可能是函数或者对象

    data = typeof data === 'function' ? data.call(vm) : data
    vm._data = data
    // 把自定义的data 进行劫持，并覆给 vm上的 _data，
    observe(data)

    // 将vm的_data用 vm 代理
    for (let key in data) {
        proxy(vm, '_data', key);
    }
}

function initComputed(vm) {
    const computed = vm.$options.computed
    const watcher = vm._computedWatchers = {}   //将计算属性的watcher保存到vm上
    // computed可能有两种形式， 对象和函数，需要分开处理
    for (let key in computed) {
        let userDef = computed[key]

        let fn = typeof userDef === 'function' ? userDef : userDef.get;
        watcher[key] = new Watcher(vm, fn, { lazy: true })

        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    // let getter = typeof userDef === 'function' ? userDef : userDef.get;
    let setter = userDef.set || (() => { })

    // 定义完之后，可以在实例上拿到对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    // 检测是否要执行这个getter
    return function () {
        const watcher = this._computedWatchers[key] // 获取到对应属性的watcher
        if (watcher.dirty) { //利用watch中的 dirty 设置缓存功能
            watcher.evaluate()  //求值后 dirty 变味了 false，下次就不求值了
        }
        // 如果watcher栈还有内容的话
        if (Dep.target) {
            watcher.depend() //让当前 计算属性watcher里面的 dep 也去收集上层的其他渲染watcher
        }
        return watcher.value
    }
}
