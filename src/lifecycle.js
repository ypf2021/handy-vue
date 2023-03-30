import { createTextVNode, createElementVNode } from "./vdom/index";
import Watcher from "./observe/watcher";
import { patch } from "./vdom/patch";

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
        const vm = this;
        const el = vm.$el;
        // patch 既有初始化功能，又有更新的功能

        const preVnode = vm._vnode; //第二次和以后执行时就可以获取到preVnode
        vm._vnode = vnode; //把第一次执行产生的虚拟节点保存到 _vnode 上
        if (preVnode) {
            vm.$el = patch(preVnode, vnode);
        } else {
            vm.$el = patch(el, vnode);
        }
    };

    /** _render
     * 执行由 render函数返回的 with _c _v _s
     * 生成虚拟节点
     * @export
     * @param {*} Vue
     */
    Vue.prototype._render = function () {
        const vm = this; // this 是 vue实例
        // 调用render函数时，获取vm中取值，从而将视图和数据绑定在一起
        let vnode = vm.$options.render.call(vm); //我们自定的with(this){return ${code}}
        return vnode;
    };

    // 创建元素 _c('div', {}, ...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments); //这个this时 with中传入的 vm
    };

    // 创建文本
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments);
    };

    // 文本中的 {{}} _v(text)
    Vue.prototype._s = function (value) {
        if (typeof value !== "object") return value;
        return JSON.stringify(value);
    };
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
    vm.$el = el;

    // 组合起来，一起放到 watcher 的执行函数中。在下面注册完watcher后就会调用 这个函数
    const updateComponent = () => {
        vm._update(vm._render());
    };

    // 第一次new Watcher 通过true来指定这是 渲染watcher，然后直接执行渲染
    new Watcher(vm, updateComponent, true); // true用于表示这是一个 渲染watcher
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
    const handlers = vm.$options[hook];
    if (handlers) {
        handlers.forEach((handler) => handler.call(vm));
    }
}
