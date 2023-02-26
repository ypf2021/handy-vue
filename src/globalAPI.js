import { mergeOptions } from './utils'
export function initGlobalAPI(Vue) {
    // mixin 和 options 是静态方法

    Vue.options = {}

    // 订阅模式
    Vue.mixin = function (mixin) {
        // 我们期望将用用户的选项和全局的 options进行合并
        this.options = mergeOptions(this.options, mixin)
    }
}
