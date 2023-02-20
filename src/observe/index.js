import { newArrayProto } from './array'

class Observer {
    constructor(data) {
        // Object.defineProperty只能劫持已经存在的属性，后增的，或者删除的,不知道

        // data.__ob__ = this; //自定义对象属性，把当前的构造函数当作属性给了 传过来的对象
        // 但如果赋值定义ob这个对象，就会一直被遍历死循环，可以将它变为不可枚举的
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false //将 __ob__ 变成不可枚举
        })

        if (Array.isArray(data)) {
            // 重写数组方法。7个可以修改数组本身的方法。并将数组中的引用类型劫持
            // 需要保留原有的数组特性，修改部分方法
            data.__proto__ = newArrayProto
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    walk(data) { //循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }

    observeArray(data) {
        // 如果数组中存在对象，也能检测到。
        data.forEach(item => {
            observe(item)
        })
    }
}

export function defineReactive(target, key, value) { //属性劫持

    observe(value) //递归的对所有的对象进行劫持

    Object.defineProperty(target, key, {
        get() { //取值执行
            console.log("取值")
            return value
        },
        set(newValue) { //设置值
            console.log("设置值")
            if (newValue === value) return
            value = newValue
        }
    })
}


export function observe(data) {


    // 对数据进行劫持

    if (typeof data !== 'object' || data == null) {
        return //只对对象进行劫持
    }

    //如果一个对象被劫持过了，就不需要再劫持了(可以通过增添一个实例判断是否被劫持)
    if (data.__ob__ instanceof Observer) {
        return data.__ob__;
    }



    return new Observer(data)

}