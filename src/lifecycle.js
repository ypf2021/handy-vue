import { createTextVNode, createElementVNode } from "./vdom/index"

function createElm(VNode) {
    const { tag, data, children, text } = VNode
    if (typeof tag === 'string') {  //元素标签
        VNode.el = document.createElement(tag)  //方便日后进行diff比较，把真实dom和虚拟dom进行挂载

        // 进行属性的挂载
        patchProps(VNode.el, data)

        children.forEach(child => {
            VNode.el.appendChild(createElm(child))
        });
    } else {    //文本
        VNode.el = document.createTextNode(text)
    }
    return VNode.el
}

function patch(oldVNode, VNode) {
    // 初渲染时，需要进行判断
    const isRealElement = oldVNode.nodeType // element.nodeType 是原生方法，如果是element的话 会返回1
    if (isRealElement) {
        // 这里是用虚拟节点替换真实节点

        const elm = oldVNode
        let parentElm = elm.parentNode //真实节点获取他的父节点
        let newelm = createElm(VNode)
        console.log(newelm)
        parentElm.insertBefore(newelm, elm.nextSibiling)
        parentElm.removeChild(elm)

    } else {
        // 这里是新旧vnode对比替换
    }
}

// 挂载属性
function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        console.log('将虚拟dom转换为真实dom')

        const vm = this
        const el = vm.$el
        // patch 既有初始化功能，又有更新的功能
        patch(el, vnode)
    }

    Vue.prototype._render = function () {
        console.log('生成虚拟dom')
        const vm = this // this 是 vue实例
        // 调用render函数时，获取vm中取值，从而将视图和数据绑定在一起
        let vnode = vm.$options.render.call(vm)  //我们自定的with(this){return ${code}}
        return vnode
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
    vm.$el = el
    // 1.调用render方法 产生虚拟节点 虚拟dom
    vm._update(vm._render())


    // 2.根据虚拟dom生成真实dom

    // 3.插入到el元素中
}



// 