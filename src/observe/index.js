import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
    constructor(data) {
        //给每个对象都增加一个收集功能
        this.dep = new Dep();

        // Object.defineProperty只能劫持已经存在的属性，后增的，或者删除的,不知道

        // data.__ob__ = this; //自定义对象属性，把当前的构造函数当作属性给了 传过来的对象
        // 但如果赋值定义ob这个对象，就会一直被遍历死循环，可以将它变为不可枚举的
        Object.defineProperty(data, "__ob__", {
            value: this, //__ob__的值就是 Observe实例
            enumerable: false, //将 __ob__ 变成不可枚举
        });

        if (Array.isArray(data)) {
            // 重写数组方法。7个可以修改数组本身的方法。并将数组中的引用类型劫持
            // 需要保留原有的数组特性，修改部分方法，并设定在触发时调用 notify
            data.__proto__ = newArrayProto;
            this.observeArray(data);
        } else {
            // 不是对象的话直接走walk循环遍历对象
            this.walk(data);
        }
    }
    walk(data) {
        //循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach((key) =>
            defineReactive(data, key, data[key])
        );
    }

    observeArray(data) {
        // 对数组中的每一项进行一个监听
        // 如果数组中存在对象，也能检测到。
        data.forEach((item) => {
            observe(item);
        });
    }
}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if (Array.isArray(current)) {
            dependArray(current);
        }
    }
}

export function defineReactive(target, key, value) {
    //属性劫持
    // 这个环境由于value 构成了一个闭包

    let childOb = observe(value); //递归的对所有的对象进行劫持  childOb.dep,用来收集对象本身的依赖
    let dep = new Dep(); // 每一个属性都有一个dep 并不会被销毁
    Object.defineProperty(target, key, {
        get() {
            //取值执行
            // get值添加依赖，没有get的就不会被添加。set值触发notify
            if (Dep.target) {
                dep.depend(); //让当前的dep实例记住 Dep.target 上的 watcher，
                if (childOb) {
                    //如果值是一个对象或者数组的话，那么整个 value 也会被添加 dep
                    childOb.dep.depend(); //让数组和对象本身也具有依赖和 渲染watch, 但这里只是让最外层的调用了depend，内部的还没有

                    // 深层次进行递归 让数组中的数组调用depend
                    if (Array.isArray(value)) {
                        // 对数组中的数组也进行dep收集
                        dependArray(value);
                    }
                }
            }

            return value;
        },
        set(newValue) {
            //设置值
            if (newValue === value) return;
            value = newValue;
            dep.notify(); //设置值时通知更新视图
        },
    });
}

// 初始化响应式数据时先进过这里
export function observe(data) {
    // 对数据进行劫持

    if (typeof data !== "object" || data == null) {
        return; //只对对象进行劫持，如果不是对象就返回
    }

    //如果一个对象被劫持过了，就不需要再劫持了(可以通过增添一个实例判断是否被劫持)
    if (data.__ob__ instanceof Observer) {
        return data.__ob__;
    }

    // 返回Observe实例
    return new Observer(data);
}
