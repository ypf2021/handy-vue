### 1.  请说说 Vue2 响应式数据的理解，

可以监控一个数据修改和获取操作。争对对象格式会给每个对象的属性进行劫持 `Object.defineProperty` 

> 源码层面  initData -> observe  -> defineReactive 方法，内部对所有属性递归的进行了重写，会比较耗费性能，递归增加 getter 和 setter

> 如果我们在 使用Vue，如果数据层级过深，如果数据不是响应式就不要放再data里面中。我们属性取值的时候要避免重复多次取值，放到data中但不是响应式可以通过Object. freeze ()处理

### 2.`Vue`中如何检测数组变化

vue2中检测数组的方法并没有采用defineProperty ，而是采用的重写数组的变异方法来实现数据劫持的。

> initData  --> observe --> 对我们传入的数组进行原型链修改，后续调用的方法都是重写后的方法，重写的方法为其添加了dep.notify  并对数组的每一项递归定义响应

### 3. `Vue`中如何进行依赖收集

通过 getter 和 setter将数据响应式之后，会给每个属性添加自己的 dep 。然后在渲染页面时 创建渲染watcher，并将这个 watcher 添加到 watcher栈中，进行render函数生成虚拟节点的时候，获取数据的值触发get，让属性的 dep 记住当前栈顶的watcher， 后续数据发生变化时 会触发set中的 dep.notify 让用到这个属性的watcher进行渲染。

### 4.如何理解 `Vue`中的模板编译

用户传递的时 template 属性，我们需要将这个 template 最终转换为 render 函数，再执行render函数生成虚拟节点。

- template  -> ast语法树 . 通过complierToFunction方法 将template进行 模板的截取拆解，生成ast语法树。
- ast语法树 -> render函数的字符串 -> render函数.   将生成的 ast语法树，进行遍历 生成由 _c _v _s 组成的字符串 ，再将这个字符串用 `with(this){return ${code}` 和 `new Function`组装生成render函数
- 执行render函数 生成 Vnode。再通过 _update() 将虚拟节点 进行patch 

### 5. `Vue`生命周期的钩子函数时如何个实现的

就是利用了一个发布订阅模式，将用户写的钩子维护成了一个数组，后续在代码运行到指定位置事，依次调用callback函数

> 内部就是发布者订阅者模式

### 6. `Vue`的生命周期方法有哪些？一般在哪一步发送请求及原因

- **beforeCreate**：这里没有实现响应式数据 vue3 中不需要了，注册了 events和Lifecycle
- **created**：拿到响应式的属性（不涉及dom渲染） 这个api可以在服务端渲染使用， 在vue3中setup
- beforeMount：没什么实际价值，在这里render函数以及被生成但未调用
- **mounted**：render函数被调用，并且被绑定到了页面上，有了$el，第一次渲染完毕
- beforeUpdate：更新前在 watcher 清空 异步调度队列时候调用 watcher.before()会执行
- update：更新后
- **beforeDestory**：开始销毁，但这时什么都没做，watch 响应式数据 都存在
- **destoryed** 销毁后触发，会把watcher，数据都删掉，移除监听，**但不会删除真实dom**
- errorCaptured：错误捕获



> **请求一般在 mounted时：**请求都是异步请求，代码是同步执行

### 7. `nextTick` 在哪里使用？原理是？

**nextTick** 内部采用了异步任务进行了包装（多个nextTick调用会被合并成一次，内部会合并回调）最后在异步任务中批处理。

主要应用场景就是异步更新 （默认调度的时候 就会添加一个 nextTick 任务）用户为了渲染到最终的渲染结果需要在内部任务执行之后调用nextTick(callback)。

```js
    let callbacks = []
    let wait = false;
    let flushCallbacks = function(){
        let cbs = callback.slice(0);
        cbs.forEach((cb) => cb())
        wait = false
    }

    let nextTick = function(cb){
        callbacks.push(cb)
        if(!wait){
            wait = false
            Promise.resolve().then(flushCallbacks())
        }
    }


```

### 响应式原理

1. 在vue实例化时会将实例中传入的 `options` 中的 `data` 进行 `defindeProperty` 的操作，为属性添加 `get` 和 `set` 方法
2. 在这个操作中，会对递归的对**每一个data属性**，创建一个dep实例， dep用来进行依赖收集和属性标识。
3. 之后用 `compiler` 模板解析，通过**正则识别和拆解模板的**方式生成了对应的**ast树**，ast树是对html文档的解析，争对的是**语法层面**。
4. 解析为语法树之后，根据ast转换为 由 `_c, _v, _s`组成的字符串 ` _c('div',{id:"app",style:{"color":"red"}},_v("222"))`这种格式的内容。再通过 `with` 和 `new Function()`包裹 **生成render函数**，render函数返回可以执行的那堆字符串构成的函数
5. _render()**执行render函数**，返回相应的 **VNode** 结构： `{vm, tag, key, data, children,text}`。
6. 最后通过 `_updata()` 中的 `patch`方法，将旧节点移除，并根据 vnode 生成真实dom挂载上去
7. 但是**在render函数执行前**， **先new了一个 Watcher类，并把渲染挂载方法保存好**，开始进行依赖的收集
8. new Watcher的时候会将 Dep.targe 指向这个 新watch实例（在get属性的时候判断是否被需要，进行后续操作，render和 update），
9. 之后进行 render 函数的执行，render函数执行过程中就会访问 data中的属性。这时判断是否有 `Dep.targe`，如果有就会进行依赖收集，
10. 依赖收集 ： 首先判断成功有 Dep.targe 后，会让**这个属性的 Dep实例**  调用`depend()`方法,这个方法又会执行 `Dep.target.addDep(this)` 先让 watcher实例添加这个 Dep 实例，这里会进行一个去重操作，再返回给dep实例添加Watcher。
11. watcher 和 dep 绑定完成后。 如果数据发生变化就会调用 set中的 `dep.notify()` 让用到这个属性的所有 watcher 重新进行 虚拟节点更新挂载

### 9.Vue组件间传值的方式及区别

- props 父传递数据给儿子 属性的原理就是把解析后的 props 验证后就会将属性定义在当前的实例上 vm._props(这个对象上的属性都是通过 defineReactive 来定义的 （都是响应式的）组件在渲染过程中回去 vm 上取值 _props 属性会被代理到 vm 上)
- emit 儿子触发组件更新，在创建虚拟节点的时候九江所有事件绑定到了 listeners， 通过 $on 方法绑定事件 通过 $emit方法来触发事件(发布订阅模式)
- eventBus 原理就是 发布订阅模式 $bus = new Vue() 简单的通信可以采用这种简单的方式。
- ref 可以获取dom元素和组件实例 （虚拟dom没有处理 ref，这里无法拿到实例，也无法获取组件）。创建dom时如何处理ref的？会将用户所有的dom操作及属性，都会互道一个cbs属性中  依次调用 cbs 中的create方法，这里就包含了ref相关的操作，会操作 ref 并且赋值
- provide （再负组件中将属性暴露出来） inject 后代组件中通过 inject 注入属性， 在负组件中提供数据，再子组件中递归向上查找
- $attrs （所有组件上的属性，不包括 props） $listeners（组件上所有的事件）

### 10. v-if, v-show, v-model, v-for实现原理

- v-if 会被编译为三元表达式，为false时就不会创建
- v-show 会编译为指令，并存储原来的 display属性，再none和原来的进行切换
- v-for 会编译为 _l( )  , for循环遍历
- v-model 是 v-on和v-bind的语法糖，同时还加了个中文输入的判定

### 11. 插槽的实现原理

```js
普通插槽和具名插槽
//父组件
`<my><div>{{msg}}</div></my>`
3.//子组件 渲染并查找映射关系
let result = templateCompiler.compile(`<div class="my"><slot></slot></div>`)
// _c('div',{staticClass:"my"},[_t("Default")])  用_t()来构造插槽


// 组件的孩子叫插槽，元素的孩子就是孩子
1.// 父组件的Vnode
new Vnode = {"tag":"my",componentOptions:{children:{tag:'div','hello'}}}

2.// 挂载映射关系
this.$slots = {default: [儿子虚拟节点]}
//并将结果放到 vm.$scopeSlots上  vm.$scopeSlots = {a:fn,b:fn,default:fn}

// 组件渲染真实节点时候，会将 <slot></slot>渲染为 _t('default') 再子组件render的时候 会通过 _t 找到 $scopeSlot 上对应的函数（这里是已经完成的虚拟节点）来进行替换渲染内容   ---- 直接渲染完替换

作用域插槽
//我们渲染插槽选择的作用域是子组件中的  作用域插槽渲染的时候，，将作用域插槽做成了属性 scopedSlots
// 再制作一个映射关系 $scopedSlots = {defaullt:fn:function({msg}){return _c('div',{},[_v(_s(msg))])}}, 里面的函数并没有执行，
// 稍后渲染组件的模板的时候，会通过name找到对应的函数 将数据传到函数中 这是才会渲染虚拟节点，用虚拟节点替换 _t('default') ----- 子组件用的时候再渲染
```

### 12.keep-alive使用，原理

1.常在路由组件中使用 

2.再component :is中使用 

- keeop-alive组建的原理的是默认缓存加载过的组件对应的实例， 内部采用了 LRU 算法
- 下次切换组件加载的时候， 会找到对应缓存的节点来进行初始化。用上次缓存的$el来触发替换
- 更新和销毁时会触发 activited 和 deactivited

### 13如何理解自定义指令

自定义指令就是用户定义好对应的钩子，当元素再不同状态时会调用相应的  钩子（所有钩子会被合并到元素对应的cbs上面，到时候依次调用）

### 14. Vue时间修饰符原理是什么

![image-20230307134528346](https://gitee.com/yan-running-potato/typora-diagram/raw/master/image-20230307134528346.png)

原理：都是通过模板编译实现的，

### 15. 组件data必须是函数

原因就在于针对跟实例而言，new Vue 组件是通过同一个构造函数多次创建实例

，如果是同一个对象的话那么数据会被相互影响。每个组建的数据源都是独立的，那就每次调用data返回一个新的对象

```js
Vue.extends = function (options){
    function Sub(){
        this.data = this.constructor.options.data()
    }
    Sub.options = options;
    return Sub
}
创建相同子组件实际是 new 同一个 Sub，如果是对象的话，就会相互影响到
```

### 16. computed 和 watch

computed和watch相同点： computed 和 watch底层都会创建一个watcher （用法区别 computed 定义的属性可以在模板中使用，但watch是监听值后的动作）

- computed 默认不会立即执行，只有取值的时候才会执行， 内部会维护一个 dirty 属性，用来判断依赖的值是否变化，如果变化了才能重新计算这个结果。
- watch 默认用户回提供一个回调函数，数据变化了就调用这个回调。我们可以监控某个数据的变化，数据变化了执行某些操作

### 17. $set 

Vue.$set 方法是 vue中的一个补丁方法 （正常我们添加属性是不会触发视图的更新的，我们无法见空数组的长度和索引）

如果设置的值为数组，给数组的某一项改变值，就通过 调用 slice 方法进行更改，触发重写的数组方法。

如果给对象添加属性，就对这个属性进行 defineReactive，之后再调用 ob.dep.notify() ，达到响应式的监听和更改视图。

而且不能对 整个 根实例 添加属性，不能直接重写 data或新增 data.xx。









