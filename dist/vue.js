(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    // 定义策略
    var starts = {};
    var LIFECYCLE = ["beforeCreate", "created", "mounted", "beforeMount"];
    LIFECYCLE.forEach(function (hook) {
      starts[hook] = function (parent, child) {
        // 第一次 { } + {create:function(){}}   ==>  {created:[fn]}
        // 第二次 {created:[fn]} + {create:function(){}}  ==>  {created:[fn, fn]}
        if (child) {
          if (parent) {
            return parent.concat[child];
          } else {
            return [child];
          }
        } else {
          return parent;
        }
      };
    });

    // 组件合并策略, 对传入的组件构建父子关系
    starts.components = function (parentVal, childVal) {
      var res = Object.create(parentVal);
      if (childVal) {
        for (var key in childVal) {
          res[key] = childVal[key];
        }
      }
      // 优先找自己，再找原型上的
      return res;
    };
    function mergeOptions(parent, child) {
      var options = {};

      // 对传进来的连个进行遍历，传入mergeField
      for (var key in parent) {
        mergeField(key);
      }
      for (var _key in child) {
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }
      function mergeField(key) {
        // 用策略模式减少 if else
        if (starts[key]) {
          options[key] = starts[key](parent[key], child[key]);
        } else {
          // 如果不在策略中，则以儿子的为主，优先采用儿子的
          options[key] = child[key] || parent[key];
        }
      }
      return options;
    }

    function initGlobalAPI(Vue) {
      // mixin 和 options 是静态方法

      Vue.options = {
        _base: Vue
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
          this._init(options = {});
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
        definition = typeof definition === "function" ? definition : Vue.extend(definition);
        // 把子类放到 Vue.options.components[id] 上 形成映射关系。 之后再模板编译生成字符串时用到
        Vue.options.components[id] = definition;
        console.log(Vue.options);
      };
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
      if (null != _i) {
        var _s,
          _e,
          _x,
          _r,
          _arr = [],
          _n = !0,
          _d = !1;
        try {
          if (_x = (_i = _i.call(arr)).next, 0 === i) {
            if (Object(_i) !== _i) return;
            _n = !1;
          } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
        } catch (err) {
          _d = !0, _e = err;
        } finally {
          try {
            if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== undefined) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }

    var id$1 = 0;
    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);
        this.id = id$1++;
        this.subs = []; //这里要存放 属性对应的watcher
      }
      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 这里我们不希望多次存放同一watcher、
          // this.subs.push(Dep.target)

          // 先调用watcher的  addDep , 让watcher记住 dep
          Dep.target.addDep(this);
          // 然后 watcher 调用dep的addSubs 让dep记住 watcher
        }
      }, {
        key: "addSubs",
        value: function addSubs(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          });
        }
      }]);
      return Dep;
    }();
    Dep.target = null;

    // 维护一个用来存放 Dep.target 的 栈结构
    var stack = [];
    function pushTarget(target) {
      // 把watcher传过来
      Dep.target = target;
      stack.push(target);
    }
    function popTarget() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    // 依赖手收集
    // 1. 在进行挂载时，先new 一个Watcher。 并把 Dep.taget 指向自己。 然后去调用 _render _update
    // 2. 在 _update 过程中，会去访问被监听的属性，每个属性都在initState时存了一个闭包的new Dep()
    // 3. 被用到的 属性，进入被劫持的get函数时，读取到 Dep.target，就会进行dep和watch的绑定
    // 4. 绑定过程 首先调用 dep.depend(), 这里会先让 watcher记住dep， 调用Dep.target.addDep(),在watch中进行去重。
    // 5. 如果没有重复就接着让 dep记住watcher，调用dep.addSubs()，两边各自存放入自己的数组中，实现依赖收集

    // 重写数组中的部分方法

    var oldArrayProto = Array.prototype;
    var newArrayProto = Object.create(oldArrayProto);
    var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
    methods.forEach(function (method) {
      // 重写数组方法，内部调用自定义方法
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        // todo...
        console.log("\u8C03\u7528\u4E86".concat(method));
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

        // 这里的 this 值得是方法中的this，指向的是调用方法的东西，就是我们传来的data
        var ob = this.__ob__; //拿出数组中存放的 Observe构造函数 ，调用它的 observeArray 方法

        // 对新增的数据再进行劫持。（通过方法新增的内容）
        var inserted;
        switch (method) {
          case "push":
          case "unshift":
            inserted = args;
            break;
          case "splice":
            inserted = args.slice(2);
            break;
        }
        // 获取到添加进去的参数，inserted，但它为数组，需要在调用监听数组的方法
        if (inserted) {
          ob.observeArray(inserted);
        }
        ob.dep.notify(); //调用了数组方法，通知对应watcher 实现更新操作

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);
        //给每个对象都增加一个收集功能
        this.dep = new Dep();

        // Object.defineProperty只能劫持已经存在的属性，后增的，或者删除的,不知道

        // data.__ob__ = this; //自定义对象属性，把当前的构造函数当作属性给了 传过来的对象
        // 但如果赋值定义ob这个对象，就会一直被遍历死循环，可以将它变为不可枚举的
        Object.defineProperty(data, "__ob__", {
          value: this,
          //__ob__的值就是 Observe实例
          enumerable: false //将 __ob__ 变成不可枚举
        });

        if (Array.isArray(data)) {
          // 重写数组方法。7个可以修改数组本身的方法。并将数组中的引用类型劫持
          // 需要保留原有的数组特性，修改部分方法，并设定在触发时调用 notify
          data.__proto__ = newArrayProto;
          this.observeArray(data);
        } else {
          // 不是对象的话直接走walk循环遍历对象
          this.walk(data);
        }
      }
      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          //循环对象，对属性依次劫持
          // 重新定义属性
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 对数组中的每一项进行一个监听
          // 如果数组中存在对象，也能检测到。
          data.forEach(function (item) {
            observe(item);
          });
        }
      }]);
      return Observer;
    }();
    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }
    function defineReactive(target, key, value) {
      //属性劫持
      // 这个环境由于value 构成了一个闭包

      var childOb = observe(value); //  递归的对所有的对象进行劫持 childOb.dep,用来收集对象（value）本身的依赖
      var dep = new Dep(); // 对属性添加dep 每一个属性都有一个dep 并不会被销毁
      Object.defineProperty(target, key, {
        get: function get() {
          //取值执行
          // get值添加依赖，没有get的就不会被添加。set值触发notify
          if (Dep.target) {
            dep.depend(); //让当前的dep实例记住 Dep.target 上的 watcher，
            if (childOb) {
              //如果值是一个对象或者数组的话，那么整个 value 也会被添加 dep
              childOb.dep.depend(); //让数组和对象本身也具有依赖和 渲染watch, 但这里只是让最外层的调用了depend，内部的还没有

              // 深层次进行递归 让数组中的数组调用depend
              if (Array.isArray(value)) {
                // 对数组中的数组也进行dep收集
                dependArray(value);
              }
            }
          }
          return value;
        },
        set: function set(newValue) {
          //设置值
          if (newValue === value) return;
          value = newValue;
          dep.notify(); //设置值时通知更新视图
        }
      });
    }

    // 初始化响应式数据时先进过这里
    function observe(data) {
      // 对数据进行劫持

      if (_typeof(data) !== "object" || data == null) {
        return; //只对对象进行劫持，如果不是对象就返回
      }

      //如果一个对象被劫持过了，就不需要再劫持了(可以通过增添一个实例判断是否被劫持)
      if (data.__ob__ instanceof Observer) {
        return data.__ob__;
      }

      // 返回Observe实例
      return new Observer(data);
    }

    var id = 0;

    // 每个属性有一个 dep （属性就是被观察者），watcher就是观察者（属性变化了会同通知观察者来更新） ===> 观察者模式
    var Watcher = /*#__PURE__*/function () {
      //不同组件有不同的watcher 目前只有一个渲染根实例

      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);
        // option 有三种  直接为true：标识这是渲染watcher
        //               {lazy: true} 标识是一个计算属性watcher。exprOrFn 是得到值的函数
        //               {user: true} 标识这是一个 监听属性的watcher，他会有第四个参数 cb，属性变化时的回调
        this.id = id++;
        this.vm = vm;
        if (typeof exprOrFn === "string") {
          //使用watch监听属性时这里可能是字符串
          this.getter = function () {
            return vm[exprOrFn]; // 这里取值会进行依赖收集
          };
        } else {
          this.getter = exprOrFn; //getter意味着 调用这个函数 可以发生取值操作
        }

        this.renderWatcher = options; // 是否是一个渲染Watchetr
        this.deps = []; //让watcher记住dep，后续实现计算属性，和一些清理工作需要用到
        this.depsId = new Set();
        this.lazy = options.lazy; //控制是否不立即执行get, 用于computed
        this.dirty = this.lazy; //缓存值 初始值为ture / undefined

        // 如果是lazy就不取值，否则就去调用get() 用在computed计算缓存 和 渲染watch时执行
        this.value = this.lazy ? undefined : this.get();
        this.user = options.user; // 用来判断是否是 watch监听属性的 watcher
        this.cb = cb;
      }

      // 对监听属性的求值
      _createClass(Watcher, [{
        key: "evaluate",
        value: function evaluate() {
          this.value = this.get();
          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          // 渲染watch调用get方法就可以渲染视图
          //
          pushTarget(this); //把当前的 watcher实例，放到 Dep的静态属性上。
          var value = this.getter.call(this.vm); //回去vm上取值
          popTarget(); //取值完毕后清空
          return value;
        }
      }, {
        key: "addDep",
        value: function addDep(dep) {
          var id = dep.id;
          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            // watcher记住dep并进行去重
            dep.addSubs(this); //再调用dep的 addSubs记住watcher
          }
        }
      }, {
        key: "depend",
        value: function depend() {
          //在这里取出 deps 遍历去 depend 当前的Dep.target
          var i = this.deps.length;
          while (i--) {
            this.deps[i].depend();
          }
        }

        // dep.notify 会掉用相关的 watch.update进行数据更新
      }, {
        key: "update",
        value: function update() {
          if (this.lazy) {
            // 如果是计算属性， 依赖变化了触发notice，就把脏值标识为 true 再次求值
            this.dirty = true;
          } else {
            // 对更新操作进行异步处理
            // this.get()
            queueWatcher(this); //把传入的watcher暂存起来
          }
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          var newValue = this.get();
          // 如果是 watch 属性的话，还会执行相应的回调
          if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
          }
        }
      }]);
      return Watcher;
    }(); // 异步批处理
    var queue = [];
    var has = {};
    var pending = false; //防抖

    // 对存储的 watcher 进行遍历更新
    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0); //把queue里面的1 watch 都拿出来 挨个调用run
      flushQueue.forEach(function (q) {
        return q.run();
      });
      queue = [];
      has = {};
      pending = false;
    }
    function queueWatcher(watcher) {
      var id = watcher.id;
      // 对同一个页面的多次改变去重
      if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        // 不管执行多少次数据的变化,但最终只执行一轮刷新操作，放到一起更新
        if (!pending) {
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    // 异步批处理
    var callbacks = [];
    var waiting = false;
    function flushCallbacks() {
      waiting = false;
      var cbs = callbacks.slice(0);
      cbs.forEach(function (cb) {
        return cb();
      }); // 遍历执行所有的 nextTick回调
      callbacks = [];
    }

    // nextTick中没有直接使用哪个 api ，而是采用优雅降级的方法
    // 内部采用的是 promise > MutationObserver(h5的api) > (ie专享的)setImmediate > (宏任务)setTimeout
    // 如下
    var timmerFunc;
    if (Promise) {
      timmerFunc = function timmerFunc() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      // 通过函数改变 监听元素的值 从而达到触发回调的功能
      var observer = new MutationObserver(flushCallbacks); //这里传入的回调时异步执行的
      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        characterData: true
      });
      timmerFunc = function timmerFunc() {
        textNode.textContent = 2;
      };
    } else if (setImmediate) {
      timmerFunc = function timmerFunc() {
        setImmediate(flushCallbacks);
      };
    } else {
      timmerFunc = function timmerFunc() {
        setTimeout(flushCallbacks, 0);
      };
    }

    // 用 nextTick将任务存到一个异步队列中
    function nextTick(cb) {
      callbacks.push(cb); //维护 nextTick中的 callback数组，最后一起 执行
      if (!waiting) {
        // setTimeout(() => {
        //     flushCallbacks()
        // }, 0)
        timmerFunc();
        waiting = true;
      }
    }

    function initState(vm) {
      var opts = vm.$options;
      if (opts.data) {
        initData(vm);
      }
      if (opts.computed) {
        initComputed(vm);
      }
      if (opts.watch) {
        initWatch(vm);
      }
    }

    // 检测watch
    function initWatch(vm) {
      var watch = vm.$options.watch;
      for (var key in watch) {
        var handler = watch[key]; //字符串，数组，函数三种
        if (Array.isArray(handler)) {
          // 如果是数组的话就遍历展开
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }
    }
    function createWatcher(vm, key, handler) {
      // 字符串 函数
      if (typeof handler === "string") {
        handler = vm[handler];
      }
      return vm.$watch(key, handler);
    }
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return vm[target][key];
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }

    // 初始化响应式数据
    function initData(vm) {
      var data = vm.$options.data; //data可能是函数或者对象

      // 如果是函数的话，改变this指向，对象的话原样返回
      data = typeof data === "function" ? data.call(vm) : data;
      // 把data挂载到vm上 _data
      vm._data = data;

      // 把自定义的data 进行劫持，并覆给 vm上的 _data，并进行 dep收集
      observe(data);

      // 将vm的_data用 vm 代理
      for (var key in data) {
        // 把 data 上的值放到 _data 上面
        proxy(vm, "_data", key);
      }
    }

    // 注册计算属性
    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watcher = vm._computedWatchers = {}; //将计算属性的watcher保存到vm上
      // computed可能有两种形式， 对象和函数，需要分开处理
      for (var key in computed) {
        var userDef = computed[key];

        // 如果是函数的话就是 get 函数，如果不是的话就拿到对象的get函数
        var fn = typeof userDef === "function" ? userDef : userDef.get;
        // 用lazy标注是一个计算属性watcher，并把这个watcher存起来
        watcher[key] = new Watcher(vm, fn, {
          lazy: true
        });
        defineComputed(vm, key, userDef);
      }
    }

    // 对这个 监听属性 进行定义get'set
    function defineComputed(target, key, userDef) {
      // let getter = typeof userDef === 'function' ? userDef : userDef.get;
      var setter = userDef.set || function () {};

      // 定义完之后，可以在实例上拿到对应的属性
      Object.defineProperty(target, key, {
        // 取值调用的是createComputedGetter
        get: createComputedGetter(key),
        set: setter
      });
    }

    // 定义计算属性的get'方法
    function createComputedGetter(key) {
      // 检测是否要执行这个getter
      return function () {
        var watcher = this._computedWatchers[key]; // 获取到对应属性的watcher
        if (watcher.dirty) {
          // dirty初始值为 true，求值之后变为false。之后触发 依赖属性的 notify时再变为true
          //利用watch中的 dirty 设置缓存功能
          watcher.evaluate(); //求值后 dirty 变味了 false，下次就不求值了
        }
        // 如果watcher栈还有内容的话
        if (Dep.target) {
          watcher.depend(); //让当前 计算属性watcher里面的 dep 也去收集上层的其他渲染watcher
        }

        return watcher.value;
      };
    }

    // 创建 $nextTick $watch
    function initStateMixin(Vue) {
      Vue.prototype.$nextTick = nextTick;
      Vue.prototype.$watch = function (exprOrFn, cb) {
        // exprOrFn 的值变化了，就触发对应的回调
        // exprOrFn是键名， cb是回调函数
        new Watcher(this, exprOrFn, {
          user: true
        }, cb);
      };
    }

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnaneCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    // 匹配到的分组是一个 标签名 <div <xxx
    var startTagOpen = new RegExp("^<".concat(qnaneCapture));
    // 匹配结束标签  匹配 </xxx>
    var endTag = new RegExp("<\\/".concat(qnaneCapture, "[^>]*>"));
    // 匹配属性 第一个分组时key，value是剩下的  3 或4 或5
    var attribute = /^\s([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var startTagClose = /^\s*(\/?)>/;

    // vue3用的不是正则

    /** parseHTML
     *  将html转换为 ast语法树
     *
     * @export
     * @param {*} html
     * @return {*}
     */
    function parseHTML(html) {
      // 匹配开始标签,并对标签和属性存储
      function parseStartTag() {
        // string.match(regexp) 用正则表达式匹配字符串，并返回包含搜索结果的数组。
        // 进来后先判断是否是开始标签(<div>)
        var start = html.match(startTagOpen);
        // 如果匹配到是开始的元素，就进行存储和前进
        // start结构: <div为例 start: ["<div",'div']
        if (start) {
          var Match = {
            tagName: start[1],
            //标签名
            attrs: []
          };
          advance(start[0].length);

          //  匹配完开头的 <div 就接着一直匹配，直到找到 开始标签的结束 >, 并且把其中匹配到的 属性 存起来
          var attr, _end;
          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            // 属性解析出来后 放到 match.attrs中

            Match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }
          // 匹配完属性之后，end就会被匹配到，这里再把end的 > 删掉
          if (_end) {
            advance(_end[0].length);
          }
          // 把当前标签的 属性和标签就匹配结束了
          return Match;
        }
        return false;
      }

      // 删除html
      function advance(length) {
        // 把匹配完的html删掉
        html = html.substring(length);
      }

      // 利用栈结构 构造一棵树
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = [];
      var currentParent;
      var root;
      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          attrs: attrs,
          parent: null,
          children: [],
          type: ELEMENT_TYPE
        };
      }

      // 下面三个函数用来吧匹配到的内容进行整合，最后要转化为一颗抽象语法树
      function start(tag, attrs) {
        var node = createASTElement(tag, attrs);
        if (!root) {
          //看一下这棵树是否为空，
          root = node; //如果为空，则当前就是树的根节点
        }

        if (currentParent) {
          node.parent = currentParent;
          currentParent.children.push(node);
        }
        stack.push(node);
        currentParent = node; // currentParent 为栈中的最后一个元素
      }

      function chars(text) {
        // 把全空的文本去掉(全空的文本是不会被显显示的)
        text = text.replace(/\s/g, "");
        text && currentParent.children.push({
          text: text,
          type: TEXT_TYPE,
          parent: currentParent
        });
      }
      function end(tag) {
        stack.pop();
        currentParent = stack[stack.length - 1];
      }
      while (html) {
        // 如果textEnd 为0，说明是一个开始标签(<div>) 或一个结束标签(</div>)
        // 如果textEnd >0 说明就是文本的结束位置(aaa<div>)
        var textEnd = html.indexOf("<"); //如果返回的索引是0，则说明是个标签，在开头

        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); //开始标签的匹配结果

          if (startTagMatch) {
            // 如果是开始标签就跳过了
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
          //到这里就是结束标签(如果是开始标签的话就被删掉 continue了)
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            end(endTagMatch[1]);
            advance(endTagMatch[0].length);
            continue;
          }
        }
        // 开始标签匹配 text
        if (textEnd > 0) {
          // 轮到了文本内容
          var text = html.substring(0, textEnd);
          if (text) {
            chars(text);
            advance(text.length);
          }
        }
      }
      return root;
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    // 将ast树转换为 字符串代码 _c( _v() _s())
    function codeGen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : null).concat(ast.children.length > 0 ? ",".concat(children) : "", ")");
      return code;
    }

    // 转换 属性 >>> 字符串
    function genProps(attrs) {
      var str = "";
      // let str = ''
      var _loop = function _loop() {
        var attr = attrs[i];

        // 解析样式时，将字符串形式转换为对象形式
        if (attr.name === "style") {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        }
        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
      };
      for (var i = 0; i < attrs.length; i++) {
        _loop();
      }
      return "{".concat(str.slice(0, -1), "}");
    }

    // 转换 children 遍历传递给gen函数进行处理
    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      });
    }

    // 处理传递来的child节点  处理分为 文本 和 element，
    function gen(node) {
      if (node.type === 1) {
        // 如果子元素时 节点 就直接调用
        return codeGen(node);
      } else {
        // 子元素时文本时有 3种情况， {{name}} hello , {{age}}, 111

        var text = node.text;
        // 先判断是不是纯文本
        if (!defaultTagRE.test(text)) {
          // 纯文本直接用 _v
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          // 当有 {{}} 就得多加一个 _s 例如： _v(_s(name)+'hello' + _s(name))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0;
          while (match = defaultTagRE.exec(text)) {
            // match : [ "{{age}}", "age" ]

            // 匹配到 {{}} 时的索引
            var index = match.index;
            // 将0 - {{}} 或是 {{}} - {{}}中间的存进去
            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }

            // 添加匹配到的 {{}}
            tokens.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }
          // 把最后一个 {{}} 之后的东西 也存进来
          if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }
          return "_v(".concat(tokens.join("+"), ")");
        }
      }
    }

    /** compileToFunction
     *  将模板template 转换为 render函数
     *  其中将 html 转化为 ast树，又将 ast树转换为由 _v _s 组成的函数字符串，并用 new Function的方式返回 即是render函数
     * @export
     * @param {*} template
     * @return {*}
     */
    function compileToFunction(template) {
      // 1. 就是将template 转换为 ast 语法树
      var ast = parseHTML(template);

      // 2. 生成render方法（render方法执行后的返回结果就是 虚拟DOM）

      var code = codeGen(ast); // 由ast树生成的 code 代码, 字符串代码
      code = "with(this){return ".concat(code, "}");

      // render 得到的时一个 new 出来的 with函数，   new function可以传入字符串作为函数体
      var render = new Function(code);

      // 生成render函数，返回给option.render
      return render;
    }

    // _c
    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }
      var key = data.key;
      if (key) {
        delete data.key;
      }
      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }
      if (isReservedTag(tag)) {
        return vnode(vm, tag, key, data, children, undefined);
      } else {
        // 拿到组件的 构造函数(全局调用时) / 组件的options选项(组件内使用时)
        var Ctor = vm.$options.components[tag];
        console.log("vm.$options", vm.$options, tag);

        // Ctor就是组件的定义 可能是一个 Sub 类，也有可能是组件的obj选项
        // 创造一个组件的虚拟节点 (包含组件的构造函数)
        return createComponentVnode(vm, tag, key, data, children, Ctor);
      }
    }
    function createComponentVnode(vm, tag, key, data, children, Ctor) {
      // 如果时一个对象的话 就通过 extend ，形成子类
      if (_typeof(Ctor) === "object") {
        Ctor = vm.$options._base.extend(Ctor);
      }
      console.log("Ctor", Ctor);
      data.hook = {
        // 定义一个init方法，再创建真实节点时候，如果是组件则调用此方法
        init: function init(vnode) {
          // 保存组件的实例到虚拟节点上
          console.log(vnode);
          vnode.componentInstance = new vnode.componentOptions.Ctor(); //new Sub 形成一个 组件，并进行挂载
          var instance = vnode.componentInstance;
          instance.$mount(); //走完这个 instance.$el 上就会有对应的真实dom
        }
      };

      return vnode(vm, tag, key, data, children, null, {
        Ctor: Ctor
      });
    }

    // _v
    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }
    function vnode(vm, tag, key, data, children, text, componentOptions) {
      // vnode 返回虚拟节点
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text,
        componentOptions: componentOptions // 这里饱含着组件的 构造函数
        // ......
        // ast是语法层面的解析，解析html的内容
        // 虚拟dom是节点层面，争对一个dom，可以增加各种内容
      };
    }

    function isSameVnode(vnode1, vnode2) {
      return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
    }

    // 判断是否为原始元素
    var isReservedTag = function isReservedTag(tag) {
      return ["a", "li", "span", "p", "button", "ul", "div"].includes(tag);
    };

    // 去调用虚拟节点上的 init 来创建dom
    function createComponent(Vnode) {
      var i = Vnode.data;
      if ((i = i.hook) && (i = i.init)) {
        i(Vnode);
      }
      if (Vnode.componentInstance) {
        return true;
      }
    }

    /** createElm
     *  由patch函数调用，用于将 虚拟节点递归转换为真实节点
     * @param {*} VNode
     * @return {*} 返回真实 dom
     */
    function createElm(VNode) {
      var tag = VNode.tag,
        data = VNode.data,
        children = VNode.children,
        text = VNode.text;
      if (typeof tag === "string") {
        // 创建真实元素，也要区分是组件还是元素
        if (createComponent(VNode)) {
          //是组件 同时也存在 vnode.componentInstance.$el
          return VNode.componentInstance.$el;
        }
        //元素标签
        VNode.el = document.createElement(tag); //方便日后进行diff比较，把真实dom和虚拟dom进行挂载

        // 进行属性的挂载
        patchProps(VNode.el, {}, data);
        children.forEach(function (child) {
          VNode.el.appendChild(createElm(child));
        });
      } else {
        //文本
        VNode.el = document.createTextNode(text);
      }
      return VNode.el;
    }

    /** patchProps挂载属性
     *  在 createElm中用于将虚拟dom的属性挂载到真实dom上
     * @param {*} el
     * @param {*} props
     */
    function patchProps(el) {
      var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // 老属性中有，新的中没有，要删除老的
      // style
      var oldStyles = oldProps.style || {};
      var newStyle = props.style || {};
      for (var key in oldStyles) {
        if (!newStyle[key]) {
          // 没有就滞空，有就等到下面被替换
          el.style[key] = "";
        }
      }

      //普通属性
      for (var _key in oldProps) {
        if (!props[_key]) {
          //新的没有，删除属性
          el.removeAttribute(_key);
        }
      }

      // 新的覆盖老的
      for (var _key2 in props) {
        if (_key2 === "style") {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(_key2, props[_key2]);
        }
      }
    }

    /** patch函数
     * 作用：第一次挂载虚拟节点 / 更新并挂载新的虚拟节点
     *      将虚拟节点（对比）生成真实dom并替换
     * @param {*} oldVNode 第一次调用时为真实节点，之后为以前生成的虚拟节点
     * @param {*} VNode 虚拟节点
     *
     * @return {*} Node 真实节点
     */
    function patch(oldVNode, VNode) {
      if (!oldVNode) {
        // 当 oldVnode不存在时 就是 el 不存在，该过程是对组件的挂载
        return createElm(VNode); // vm.$el 对应的就是组件渲染的结果了
      }

      // 初渲染时，需要进行判断
      var isRealElement = oldVNode.nodeType; // element.nodeType 是原生方法，如果是element的话 会返回1
      if (isRealElement) {
        // 这里是用虚拟节点替换真实节点

        var elm = oldVNode;
        var parentElm = elm.parentNode; //真实节点获取他的父节点
        var newelm = createElm(VNode);
        parentElm.insertBefore(newelm, elm.nextSibiling);
        parentElm.removeChild(elm);
        return newelm;
      } else {
        return patchVnode(oldVNode, VNode);
      }
    }

    // 新旧dom比较的过程
    function patchVnode(oldVNode, VNode) {
      // diff算法 是一个平级比较的过程，父亲和父亲比，儿子和儿子比
      // 1. 两个节点不是同一个节点，直接删除老的换上新的 （没有对比）
      // 2. 两个节点是同一个节点 （判断节点中的tag 和 节点的key） 再比较属性是否有差异，复用老的节点
      // 3. 比较完毕后就需要比较两人的儿子

      if (!isSameVnode(oldVNode, VNode)) {
        // 连个节点不是相同节点时，
        // 进行节点的替换
        var _el = createElm(VNode);
        oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
        return _el;
      }
      var el = VNode.el = oldVNode.el; // 节点相同，复用老节点

      // 文本的情况
      if (!oldVNode.tag) {
        // 是文本元素
        if (oldVNode.text !== VNode.text) {
          el.textContent = VNode.text; //用新的文本把旧文本覆盖
        }
      }
      // 是相同标签和相同id， 再比较标签的属性,
      patchProps(el, oldVNode.data, VNode.data);

      // 下一层
      // 比较儿子 比较的时候： 一方有，一方无；
      //                      两边都有
      var oldChildren = oldVNode.children || [];
      var newChildren = VNode.children || [];
      if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的diff比较
        updateChildren(el, oldChildren, newChildren);
      } else if (newChildren.length > 0) {
        // 没老 有新 全添加
        mountChildren(el, newChildren);
      } else if (oldChildren.length > 0) {
        // 没新 有老 全清空
        el.innerHTML = ""; //可以循环删除
      }
      // 最后把转换后的 真实dom:el返回
      return el;
    }

    // 老没 新有 全添加
    function mountChildren(el, newChildren) {
      for (var i = 0; i < newChildren.length; i++) {
        var child = newChildren[i];
        el.appendChild(createElm(child));
      }
    }
    function updateChildren(el, oldChildren, newChildren) {
      // 我们操作列表 经常会有 push shift pop unshift reverse sort 这种方法，（针对这种方法进行优化）
      // vue2中采用的是双指针的方式 比较两个节点
      // 四个指针
      var oldStartIndex = 0;
      var newStartIndex = 0;
      var oldEndIndex = oldChildren.length - 1;
      var newEndIndex = newChildren.length - 1;
      // 四个指针处的节点
      var oldStartVnode = oldChildren[0];
      var newStartVnode = newChildren[0];
      var oldEndVnode = oldChildren[oldEndIndex];
      var newEndVnode = newChildren[newEndIndex];
      function makeIndexByKey(children) {
        var map = {};
        children.forEach(function (child, index) {
          map[child.key] = index;
        });
        return map;
      }
      var map = makeIndexByKey(oldChildren);
      while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 有一方头指针大于尾指针就终止循环

        // 如果中途遇到了空的children 就掠过
        if (!oldStartVnode) {
          oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
          oldEndVnode = oldChildren[--oldEndIndex];
        }

        // 头头比较
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode); // 如果是相同节点，就递归的比较子节点
          oldStartVnode = oldChildren[++oldStartIndex];
          newStartVnode = newChildren[++newStartIndex];
        }
        // 尾尾比较
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode);
          oldEndVnode = oldChildren[--oldEndIndex];
          newEndVnode = newChildren[--newEndIndex];
        }
        // 交叉比对 abcd => dcba 尾头
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
          patchVnode(oldEndVnode, newStartVnode);
          el.insertBefore(oldEndVnode.el, oldStartVnode.el);
          oldEndVnode = oldChildren[--oldEndIndex];
          newStartVnode = newChildren[++newStartIndex];
        }
        // 交叉比对 头尾
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
          patchVnode(oldStartVnode, newEndVnode);
          el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibiling);
          oldStartVnode = oldChildren[++oldStartIndex];
          newEndVnode = newChildren[--newEndIndex];
        } else {
          // 乱序时候对比
          // 根据老的列表做一个映射关系，用新的去挨个找，找到则移动，找不到则添加，最后多余就删除
          var moveIndex = map[newStartVnode.key]; // 如果拿到说明是我要移动的索引
          if (moveIndex !== undefined) {
            var moveVnode = oldChildren[moveIndex]; //找到对应的虚拟节点复用
            el.insertBefore(moveVnode.el, oldStartVnode.el);
            oldChildren[moveIndex] = undefined; //表示这哥节点已经移动走了
            patchVnode(moveVnode, newStartVnode); // 对比属性和子节点
          } else {
            el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
          }
          newStartVnode = newChildren[++newStartIndex];
        }
      }

      // 前面的节点一样，newVnode多了一些节点
      if (newStartIndex <= newEndIndex) {
        for (var i = newStartIndex; i <= newEndIndex; i++) {
          var childElm = createElm(newChildren[i]);
          // 参照物 anchor 。 可能是向前追加也可能是向后
          var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; //获取下一个元素的内容

          el.insertBefore(childElm, anchor); // anchor 为null时候会人为是 appendChind
        }
      }

      // 前面的节点一样，newVnode少了几个节点
      if (oldStartIndex <= oldEndIndex) {
        for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
          var _childElm = oldChildren[_i].el;
          el.removeChild(_childElm);
        }
      }
    }

    /** initLifeCycle
     *  在Vue.prototype 上挂载 _update _render _c _v _s 函数
     * @export
     * @param {*} Vue
     */
    function initLifeCycle(Vue) {
      /** _update
       *  在这里调用 patch函数
       *  将传过来的 Vnode 和 oldVnode 传入patch中
       * @export
       * @param {*} vnode
       */
      Vue.prototype._update = function (vnode) {
        var vm = this;
        var el = vm.$el;
        // patch 既有初始化功能，又有更新的功能

        var preVnode = vm._vnode; //第二次和以后执行时就可以获取到preVnode
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
        var vm = this; // this 是 vue实例
        // 调用render函数时，获取vm中取值，从而将视图和数据绑定在一起
        var vnode = vm.$options.render.call(vm); //我们自定的with(this){return ${code}}
        return vnode;
      };

      // 创建元素 _c('div', {}, ...children)
      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments))); //这个this时 with中传入的 vm
      };

      // 创建文本
      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      // 文本中的 {{}} _v(text)
      Vue.prototype._s = function (value) {
        if (_typeof(value) !== "object") return value;
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
    function mountComponent(vm, el) {
      vm.$el = el;

      // 组合起来，一起放到 watcher 的执行函数中。在下面注册完watcher后就会调用 这个函数
      var updateComponent = function updateComponent() {
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
    function callHook(vm, hook) {
      var handlers = vm.$options[hook];
      if (handlers) {
        handlers.forEach(function (handler) {
          return handler.call(vm);
        });
      }
    }

    function initMixin(Vue) {
      /** _init
       *  调用 initState 和 $mount
       * @export
       * @param {*} Vue
       */
      Vue.prototype._init = function (options) {
        var vm = this;

        // 把options注册到实例上，
        vm.$options = mergeOptions(this.constructor.options, options);

        // 在状态初始化之前调用 beforeCreate
        callHook(vm, "beforeCreate");

        // 初始化状态
        initState(vm);

        // 在状态初始化后 调用create
        callHook(vm, "created");
        if (options.el) {
          vm.$mount(options.el);
          callHook(vm, "mounted");
        }
      };
      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el); // 对用户写入的 el 进行 querySelector处理
        var opts = vm.$options;

        // 首先判断有无 render函数， 下来再有el的情况下，优先选择template 其次才是 innerhtml

        if (!opts.render) {
          // 先查找是否有 rebnder 函数
          var template;
          if (!opts.template && el) {
            // 如果 options 里没有template 并且找到了 el
            template = el.outerHTML;
          } else {
            //有template 有el， 有template 没el，没templae 没el
            template = opts.template;
          }
          // 写了template 就用 template
          if (template) {
            // 最终是拿到template ， 然后去解析这个模板
            var render = compileToFunction(template);
            // 把render函数挂载到了 opts上面
            opts.render = render;
          }
        }
        // 组件的挂载
        mountComponent(vm, el);
      };
    }

    function Vue(options) {
      this._init(options);
    }
    initMixin(Vue);
    initLifeCycle(Vue);
    initGlobalAPI(Vue);
    initStateMixin(Vue);

    // vue核心流程
    // 1）创造了响应式数据，2）模板转换为ast语法树，3）将ast语法树转换为render函数
    // 4）运行render函数生成 虚拟dom（之后每次数据更新就执行render函数）

    return Vue;

}));
//# sourceMappingURL=vue.js.map
