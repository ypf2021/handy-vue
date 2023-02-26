import { createTextVNode, createElementVNode } from "./vdom/index"
import Watcher from './observe/watcher'
/** createElm
 *  由patch函数调用，用于将 虚拟节点递归转换为真实节点
 * @param {*} VNode
 * @return {*} 返回真实 dom
 */
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

/** patch函数
 * 作用：第一次挂载虚拟节点 / 更新并挂载新的虚拟节点
 *      将虚拟节点（对比）生成真实dom并替换
 * @param {*} oldVNode 第一次调用时为真实节点，之后为以前生成的虚拟节点
 * @param {*} VNode 虚拟节点
 */
function patch(oldVNode, VNode) {
    // 初渲染时，需要进行判断
    const isRealElement = oldVNode.nodeType // element.nodeType 是原生方法，如果是element的话 会返回1
    if (isRealElement) {
        // 这里是用虚拟节点替换真实节点

        const elm = oldVNode
        let parentElm = elm.parentNode //真实节点获取他的父节点
        let newelm = createElm(VNode)
        parentElm.insertBefore(newelm, elm.nextSibiling)
        parentElm.removeChild(elm)
        return newelm
    } else {
        // 这里是新旧vnode对比替换
    }
}

/** patchProps挂载属性
 *  在 createElm中用于将虚拟dom的属性挂载到真实dom上
 * @param {*} el
 * @param {*} props
 */
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


/** initLifeCycle
 *  在Vue.prototype 上挂载 _update _render _c _v _s 函数
 * @export
 * @param {*} Vue
 */
export function initLifeCycle(Vue) {

    /** _update
     *  在这里调用 patch函数 
     *  将传过来的 Vnode 和 oldVnode 传入patch中
     * @export 
     * @param {*} vnode
     */
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        // patch 既有初始化功能，又有更新的功能
        vm.$el = patch(el, vnode)
    }

    /** _render
     * 执行由 render函数返回的 with _c _v _s 
     * 生成虚拟节点
     * @export
     * @param {*} Vue
     */
    Vue.prototype._render = function () {
        console.log("_render")
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

// 
/** 挂载函数
 *  调用 render生成虚拟dom ，再调用update 通过patch进行挂载虚拟dom
 *  （第一次调用时被 $mount 调用）
 * @export
 * @param {*} vm vue实例
 * @param {*} el 第一次调用时为真实dom，之后为 生成的虚拟节点
 */
export function mountComponent(vm, el) {
    vm.$el = el

    const updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, true) // true用于表示这是一个 渲染watcher
}

// 
/** callHook 
 *  注册生命周期的钩子函数,在指定位置调用 callHook(vm,hook) 
 *  就可以在那个位置依次执行被定义的生命周期函数了
 * @export
 * @param {*} vm
 * @param {*} hook
 */
export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        handlers.forEach(handler => handler.call(vm))
    }

}