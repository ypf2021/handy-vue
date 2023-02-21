import { createTextVNode, createElementVNode } from "./vdom/index"

export function initLifeCycle(Vue) {
    Vue.prototype._update = function () {
        console.log('update')
    }

    Vue.prototype._render = function () {
        console.log('render')
        const vm = this // this 是 vue实例
        // 调用render函数时，获取vm中取值，从而将视图和数据绑定在一起
        let vnode = vm.$options.render.call(vm)  //我们自定的with(this){return ${code}}
        console.log("vnode:", vnode)
    }

    // 创建元素 _c('div', {}, ...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments) //这个this时 with中传入的 vm

    }

    // 创建文本
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }

    // 文本中的 {{}} _v(text)
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value)
    }

}



export function mountComponent(vm, el) {

    // 1.调用render方法 产生虚拟节点 虚拟dom
    vm._update(vm._render())


    // 2.根据虚拟dom生成真实dom

    // 3.插入到el元素中
}



// 