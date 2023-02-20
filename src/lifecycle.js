export function initLifeCycle(Vue) {
    Vue.prototype._update = function () {
        console.log('update')
    }

    Vue.prototype._render = function () {
        console.log('render')
    }
}



export function mountComponent(vm, el) {

    // 1.调用render方法 产生虚拟节点 虚拟dom



    // 2.根据虚拟dom生成真实dom

    // 3.插入到el元素中
}



// 