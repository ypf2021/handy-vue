import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {

        const vm = this

        // 把options注册到实例上，
        vm.$options = options

        // 初始化状态
        initState(vm)

        if (options.el) {
            vm.$mount(options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el) // 对用户写入的 el 进行 querySelector处理
        let opts = vm.$options

        // 首先判断有无 render函数， 下来再有el的情况下，优先选择template 其次才是 innerhtml

        if (!opts.render) { // 先查找是否有 rebnder 函数
            let template
            if (!opts.template && el) { // 如果 options 里没有template 并且找到了 el
                template = el.outerHTML
            } else {  //有template 有el， 有template 没el，没templae 没el
                if (el) { // 判断 el 是否存在， 没有el没法挂载
                    // 有el 就有 template
                    template = opts.template
                }
            }
            // 写了template 就用 template
            if (template) {
                // 最终是拿到template ， 然后去解析这个模板
                const render = compileToFunction(template)
                // 把render函数挂载到了 opts上面
                opts.render = render
            }

        }

        // 组件的挂载
        mountComponent(vm, el)


    }
}

