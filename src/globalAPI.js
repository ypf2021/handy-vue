import { mergeOptions } from "./utils";
export function initGlobalAPI(Vue) {
    // mixin 和 options 是静态方法

    Vue.options = {
        _base: Vue,
    };

    // 订阅模式
    Vue.mixin = function (mixin) {
        // 我们期望将用用户的选项和全局的 options进行合并
        this.options = mergeOptions(this.options, mixin);
    };

    // 简单的通过继承的方式 实现子组件创建的api Vue.extend
    // 用法：
    // let Sub = Vue.extend({
    //     template: '<button>dianwoa</button>'
    // });
    // new Sub().$mount('#app')

    // 用来创建组建的构造函数，new之后可以挂载
    Vue.extend = function (options) {
        function Sub() {
            this._init((options = {}));
        }
        Sub.prototype = Object.create(Vue.prototype);
        Sub.prototype.constructor = Sub;

        // 希望将用户传入的参数 和全局的 Vue.options 来合并
        Sub.options = mergeOptions(Vue.options, options); //mergeOptions(this.constructor.options, options)
        return Sub;
    };

    // 注册组件
    Vue.options.components = {};
    Vue.component = function (id, definition) {
        // 如果definition已经是一个函数了，说明用户自己调用了 Vue.extend

        // 得到进过 Vue.extend 之后生成的子类
        definition =
            typeof definition === "function"
                ? definition
                : Vue.extend(definition);
        // 把子类放到 Vue.options.components[id] 上 形成映射关系。 之后再模板编译生成字符串时用到
        Vue.options.components[id] = definition;
        console.log(Vue.options);
    };
}
