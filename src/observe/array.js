// 重写数组中的部分方法

let oldArrayProto = Array.prototype

export let newArrayProto = Object.create(oldArrayProto)

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method => {
    // 重写数组方法，内部调用自定义方法
    newArrayProto[method] = function (...args) {
        // todo...
        console.log(`调用了${method}`)
        const result = oldArrayProto[method].call(this, ...args)

        // 这里的 this 值得是方法中的this，指向的是调用方法的东西，就是我们传来的data 
        let ob = this.__ob__    //拿出数组中存放的 Observe构造函数 ，调用它的 observeArray 方法

        // 对新增的数据再进行劫持
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2)
                break;
            default:
                break;
        }
        // 获取到添加进去的参数，inserted，但它为数组，需要在调用监听数组的方法
        if (inserted) {
            ob.observeArray(inserted)
        }
        console.log(ob)
        ob.dep.notify() //调用了数组方法，通知对应watcher 实现更新操作

        return result
    }
})






