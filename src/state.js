import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

// 检测watch
function initWatch(vm) {
    let watch = vm.$options.watch;
    for (let key in watch) {
        const handler = watch[key]; //字符串（调用对应的method），数组（多个处理函数），函数三种
        if (Array.isArray(handler)) {
            // 如果是数组的话就遍历展开
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler);
            }
        } else {
            createWatcher(vm, key, handler);
        }
    }
}

function createWatcher(vm, key, handler) {
    // 字符串 函数
    if (typeof handler === "string") {
        // 拿到对应的method
        handler = vm[handler];
    }

    // watch调用的始终是 vm.$watch
    return vm.$watch(key, handler);
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newValue) {
            vm[target][key] = newValue;
        }
    });
}

// 初始化响应式数据
function initData(vm) {
    let data = vm.$options.data; //data可能是函数或者对象

    // 如果是函数的话，改变this指向，对象的话原样返回
    data = typeof data === "function" ? data.call(vm) : data;
    // 把data挂载到vm上 _data
    vm._data = data;

    // 把 data 进行劫持，并覆给 vm上的 _data，并进行 dep收集
    observe(data);

    // 将vm的_data用 vm 代理
    for (let key in data) {
        // 把 data 上的值放到 _data 上面
        proxy(vm, "_data", key);
    }
}

// 注册计算属性
function initComputed(vm) {
    const computed = vm.$options.computed;
    const watcher = (vm._computedWatchers = {}); //将计算属性的watcher保存到vm上
    // computed可能有两种形式， 对象和函数，需要分开处理  { [key: string]: Function | { get: Function, set: Function } }
    for (let key in computed) {
        let userDef = computed[key];

        // 如果是函数的话就是 get 函数，如果不是的话就拿到对象的get函数
        let fn = typeof userDef === "function" ? userDef : userDef.get;
        // 用lazy标注是一个计算属性watcher，并把这个watcher存起来
        watcher[key] = new Watcher(vm, fn, { lazy: true });

        // 参数为 vm ，计算属性名字，get函数
        defineComputed(vm, key, userDef);
    }
}

// 对这个 监听属性 进行定义get'set
function defineComputed(target, key, userDef) {
    // let getter = typeof userDef === 'function' ? userDef : userDef.get;
    // 如果有set就拿到set，没有就是空的函数
    let setter = userDef.set || (() => {});

    // 定义完之后，可以在实例上拿到对应的属性
    // 随后在 vm上定义这个计算属性，定义他的getset方法
    Object.defineProperty(target, key, {
        // 取值调用的是createComputedGetter
        get: createComputedGetter(key),
        set: setter
    });
}

// 定义计算属性的get'方法
function createComputedGetter(key) {
    // 检测是否要执行这个getter
    return function () {
        const watcher = this._computedWatchers[key]; // 获取到对应属性的watcher
        if (watcher.dirty) {
            // dirty初始值为 true，求值之后变为false。之后触发 依赖属性的 notify时再变为true
            //利用watch中的 dirty 设置缓存功能

            // 在 evaluate 的时候，计算属性watcher会处于栈顶位置，所以依赖到的数据也会将这个watcher添加进去
            watcher.evaluate(); //求值后 dirty 变味了 false，下次就不求值了
        }
        // 如果watcher栈还有内容的话
        if (Dep.target) {
            //
            watcher.depend(); //让当前 计算属性watcher里面的 dep 也去收集上层的其他渲染watcher，进行update更新（计算属性watcher的update只会改变dirty，需要让渲染wather更新页面）
        }
        return watcher.value;
    };
}

// 创建 $nextTick $watch
export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exprOrFn, cb) {
        // exprOrFn 的值变化了，就触发对应的回调
        // exprOrFn是键名， cb是回调函数
        new Watcher(this, exprOrFn, { user: true }, cb);
    };
}
