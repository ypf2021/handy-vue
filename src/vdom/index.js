// _c
export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {};
    }
    let key = data.key;
    if (key) {
        delete data.key;
    }

    if (isReservedTag(tag)) {
        return vnode(vm, tag, key, data, children, undefined);
    } else {
        // 拿到组件的 构造函数(全局调用时) / 组件的options选项(组件内使用时)
        let Ctor = vm.$options.components[tag];
        console.log('vm.$options',vm.$options,tag)

        // Ctor就是组件的定义 可能是一个 Sub 类，也有可能是组件的obj选项
        // 创造一个组件的虚拟节点 (包含组件的构造函数)
        return createComponentVnode(vm, tag, key, data, children, Ctor);
    }
}

function createComponentVnode(vm, tag, key, data, children, Ctor) {
    // 把没有包装的对象包装一下，都成了一个构造函数
    if (typeof Ctor === "object") {
        Ctor = vm.$options._base.extend(Ctor);
    }
    console.log('Ctor',Ctor)
    data.hook = {
        // 定义一个init方法，再创建真实节点时候吗，如果是组件则调用此方法
        init(vnode) {
            // 保存组件的实例到虚拟节点上
            console.log(vnode)
            vnode.componentInstance = new vnode.componentOptions.Ctor;
            let instance = vnode.componentInstance;
            instance.$mount(); //走完这个 instance.$el 上就会有对应的真实dom
        },
    };

    return vnode(vm, tag, key, data, children, null, { Ctor });
}

// _v
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, key, data, children, text, componentOptions) {
    // vnode 返回虚拟节点
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions, // 这里饱含着组件的 构造函数
        // ......
        // ast是语法层面的解析，解析html的内容
        // 虚拟dom是节点层面，争对一个dom，可以增加各种内容
    };
}

export function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}

// 判断是否为原始元素
const isReservedTag = (tag) => {
    return ["a", "li", "span", "p", "button", "ul",'div'].includes(tag);
};
