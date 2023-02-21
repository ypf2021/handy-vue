// _c
export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    return vnode(vm, tag, key, data, children, undefined)
}

// _v

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, key, data, children, text) {
    // vnode 返回虚拟节点
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
        // ......
        // ast是语法层面的解析，解析html的内容
        // 虚拟dom是节点层面，争对一个dom，可以增加各种内容 
    }
}