// 定义策略
const starts = {}
const LIFECYCLE = [
    'beforeCreate',
    'created',
    'mounted',
    'beforeMount'
]
LIFECYCLE.forEach(hook => {
    starts[hook] = function (parent, child) {
        // 第一次 { } + {create:function(){}}   ==>  {created:[fn]}
        // 第二次 {created:[fn]} + {create:function(){}}  ==>  {created:[fn, fn]}
        if (child) {
            if (parent) {
                return parent.concat[child]
            } else {
                return [child]
            }
        } else {
            return parent
        }
    }
});

export function mergeOptions(parent, child) {
    const options = {}

    // 对传进来的连个进行遍历，传入mergeField
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        // 用策略模式减少 if else
        if (starts[key]) {
            options[key] = starts[key](parent[key], child[key])
        } else {
            // 如果不在策略中，则以儿子的为主，优先采用儿子的
            options[key] = child[key] || parent[key]
        }
    }
    return options
}