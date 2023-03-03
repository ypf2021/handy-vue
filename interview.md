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















