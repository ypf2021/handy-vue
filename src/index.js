import { initGlobalAPI } from './globalAPI'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'

function Vue(options) {
    this._init(options)
}

initMixin(Vue)
initLifeCycle(Vue)
initGlobalAPI(Vue)
initStateMixin(Vue)


export default Vue


// vue核心流程
// 1）创造了响应式数据， 2）模板转换为ast语法树  3）将ast语法树转换为render函数
// 4）运行render函数生成 虚拟dom（之后每次数据更新就执行render函数）

