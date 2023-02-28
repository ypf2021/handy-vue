import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

// import { createElm, patch } from "./vdom/patch";
// import { compileToFunction } from "./compiler/index";

function Vue(options) {
    this._init(options);
}

initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);
initStateMixin(Vue);

// // |---------------------- 测试虚拟节点  ------------------------|

// let render1 = compileToFunction(`<ul style="color:#bbbb;">
// <li key="a">a</li>
//  <li key="b">b</li>
//  <li key="c">c</li>
//  <li key="d">d</li>

// </ul>`);
// let vm1 = new Vue({ data: { name: "yp" } });
// let prevVnode = render1.call(vm1);

// let el = createElm(prevVnode);
// document.body.appendChild(el);

// let render2 = compileToFunction(`<ul style="color: rgba(189, 28, 28, 0.73);">

//     <li key="b">b</li>
//     <li key="m">m</li>
//     <li key="a">a</li>
//     <li key="p">p</li>
//     <li key="c">c</li>
//     <li key="q">q</li>

//     </ul>`);
// let vm2 = new Vue({ data: { name: "lza" } });
// let nextVnode = render2.call(vm2);

// setTimeout(() => {
//     patch(prevVnode, nextVnode);
// }, 1000);

export default Vue;

// vue核心流程
// 1）创造了响应式数据， 2）模板转换为ast语法树  3）将ast语法树转换为render函数
// 4）运行render函数生成 虚拟dom（之后每次数据更新就执行render函数）
