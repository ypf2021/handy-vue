import { parseHTML } from "./parse";
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// 将ast树转换为 字符串代码 _c( _v() _s())
function codeGen(ast) {
    let children = genChildren(ast.children);
    let code = `_c('${ast.tag}',${
        ast.attrs.length > 0 ? genProps(ast.attrs) : null
    }${ast.children.length > 0 ? `,${children}` : ""})`;
    return code;
}

// 转换 属性 >>> 字符串
function genProps(attrs) {
    let str = "";
    // let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];

        // 解析样式时，将字符串形式转换为对象形式
        if (attr.name === "style") {
            let obj = {};
            let arr = attr.value.split(";").forEach((item) => {
                let [key, value] = item.split(":");
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }

    return `{${str.slice(0, -1)}}`;
}

// 转换 children 遍历传递给gen函数进行处理
function genChildren(children) {
    return children.map((child) => gen(child));
}

// 处理传递来的child节点  处理分为 文本 和 element，
function gen(node) {
    if (node.type === 1) {
        // 如果子元素时 节点 就直接调用
        return codeGen(node);
    } else {
        // 子元素时文本时有 3种情况， {{name}} hello , {{age}}, 111

        let text = node.text;
        // 先判断是不是纯文本
        if (!defaultTagRE.test(text)) {
            // 纯文本直接用 _v
            return `_v(${JSON.stringify(text)})`;
        } else {
            // 当有 {{}} 就得多加一个 _s 例如： _v(_s(name)+'hello' + _s(name))
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while ((match = defaultTagRE.exec(text))) {
                // match : [ "{{age}}", "age" ]

                // 匹配到 {{}} 时的索引
                let index = match.index;
                // 将0 - {{}} 或是 {{}} - {{}}中间的存进去
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }

                // 添加匹配到的 {{}}
                tokens.push(`_s(${match[1].trim()})`);

                lastIndex = index + match[0].length;
            }
            // 把最后一个 {{}} 之后的东西 也存进来
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${tokens.join("+")})`;
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
export function compileToFunction(template) {
    // 1. 就是将template 转换为 ast 语法树
    let ast = parseHTML(template);

    // 2. 生成render方法（render方法执行后的返回结果就是 虚拟DOM）

    let code = codeGen(ast); // 由ast树生成的 code 代码, 字符串代码
    code = `with(this){return ${code}}`;

    // render 得到的时一个 new 出来的 with函数，   new function可以传入字符串作为函数体
    let render = new Function(code);

    // 生成render函数，返回给option.render
    return render;
}
