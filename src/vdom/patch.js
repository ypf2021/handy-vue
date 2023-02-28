import { isSameVnode } from "./index";

/** createElm
 *  由patch函数调用，用于将 虚拟节点递归转换为真实节点
 * @param {*} VNode
 * @return {*} 返回真实 dom
 */
export function createElm(VNode) {
    const { tag, data, children, text } = VNode;
    if (typeof tag === "string") {
        //元素标签
        VNode.el = document.createElement(tag); //方便日后进行diff比较，把真实dom和虚拟dom进行挂载

        // 进行属性的挂载
        patchProps(VNode.el, {}, data);

        children.forEach((child) => {
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
export function patchProps(el, oldProps = {}, props = {}) {
    // 老属性中有，新的中没有，要删除老的
    // style
    let oldStyles = oldProps.style || {};
    let newStyle = props.style || {};
    for (let key in oldStyles) {
        if (!newStyle[key]) {
            // 没有就滞空，有就等到下面被替换
            el.style[key] = "";
        }
    }

    //普通属性
    for (let key in oldProps) {
        if (!props[key]) {
            //新的没有，删除属性
            el.removeAttribute(key);
        }
    }

    // 新的覆盖老的
    for (let key in props) {
        if (key === "style") {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

/** patch函数
 * 作用：第一次挂载虚拟节点 / 更新并挂载新的虚拟节点
 *      将虚拟节点（对比）生成真实dom并替换
 * @param {*} oldVNode 第一次调用时为真实节点，之后为以前生成的虚拟节点
 * @param {*} VNode 虚拟节点
 */
export function patch(oldVNode, VNode) {
    // 初渲染时，需要进行判断
    const isRealElement = oldVNode.nodeType; // element.nodeType 是原生方法，如果是element的话 会返回1
    if (isRealElement) {
        // 这里是用虚拟节点替换真实节点

        const elm = oldVNode;
        let parentElm = elm.parentNode; //真实节点获取他的父节点
        let newelm = createElm(VNode);
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
        //连个节点不是相同节点时，
        // 进行节点的替换
        let el = createElm(VNode);
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
        return el;
    }

    let el = (VNode.el = oldVNode.el); // 节点相同，复用老节点

    // 文本的情况
    if (!oldVNode.tag) {
        // 是文本元素
        if (oldVNode.text !== VNode.text) {
            el.textContent = VNode.text; //用新的文本把旧文本覆盖
        }
    }
    // 是相同标签， 再比较标签的属性,
    patchProps(el, oldVNode.data, VNode.data);

    // 比较儿子 比较的时候： 一方有，一方无；
    //                      两边都有
    let oldChildren = oldVNode.children || [];
    let newChildren = VNode.children || [];

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
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElm(child));
    }
}

function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表 经常会有 push shift pop unshift reverse sort 这种方法，（针对这种方法进行优化）
    // vue2中采用的是双指针的方式 比较两个节点
    // 四个指针
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;
    // 四个指针处的节点
    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0];
    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
        let map = {};
        children.forEach((child, index) => {
            map[child.key] = index;
        });
        return map;
    }

    let map = makeIndexByKey(oldChildren);

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
            let moveIndex = map[newStartVnode.key]; // 如果拿到说明是我要移动的索引
            if (moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex]; //找到对应的虚拟节点复用
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
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childElm = createElm(newChildren[i]);
            // 参照物 anchor 。 可能是向前追加也可能是向后
            let anchor = newChildren[newEndIndex + 1]
                ? newChildren[newEndIndex + 1].el
                : null; //获取下一个元素的内容

            el.insertBefore(childElm, anchor); // anchor 为null时候会人为是 appendChind
        }
    }

    // 前面的节点一样，newVnode少了几个节点
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let childElm = oldChildren[i].el;
            el.removeChild(childElm);
        }
    }
}
