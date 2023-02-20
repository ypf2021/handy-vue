import { observe } from "./observe/index"

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
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