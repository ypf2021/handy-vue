const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnaneCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配到的分组是一个 标签名 <div <xxx
const startTagOpen = new RegExp(`^<${qnaneCapture}`);
// 匹配结束标签  匹配 </xxx> 
const endTag = new RegExp(`<\\/${qnaneCapture}[^>]*>`);
// 匹配属性 第一个分组时key，value是剩下的  3 或4 或5
const attribute = /^\s([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// vue3用的不是正则

export function parseHTML(html) {

    // 匹配开始标签,并对标签和属性存储
    function parseStartTag() {
        // string.match(regexp) 用正则表达式匹配字符串，并返回包含搜索结果的数组。
        // 进来后先判断是否是开始标签(<div>)
        const start = html.match(startTagOpen)
        // 如果匹配到是开始的元素，就进行存储和前进
        // start结构: <div为例 start: ["<div",'div']
        if (start) {

            const Match = {
                tagName: start[1], //标签名
                attrs: []
            }
            advance(start[0].length)

            //  匹配完开头的 <div 就接着一直匹配，直到找到 开始标签的结束 >, 并且把其中匹配到的 属性 存起来
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                // 属性解析出来后 放到 match.attrs中

                Match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })

            }
            // 匹配完属性之后，end就会被匹配到，这里再把end的 > 删掉
            if (end) {
                advance(end[0].length)
            }
            // 把当前标签的 属性和标签就匹配结束了
            return Match
        }
        return false
    }

    // 删除html
    function advance(length) {
        // 把匹配完的html删掉
        html = html.substring(length)
    }

    // 利用栈结构 构造一棵树
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = [];
    let currentParent;
    let root;

    function createASTElement(tag, attrs) {
        return {
            tag,
            attrs,
            parent: null,
            children: [],
            type: ELEMENT_TYPE
        }
    }

    // 下面三个函数用来吧匹配到的内容进行整合，最后要转化为一颗抽象语法树
    function start(tag, attrs) {
        let node = createASTElement(tag, attrs)
        if (!root) {    //看一下这棵树是否为空，
            root = node //如果为空，则当前就是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node // currentParent 为栈中的最后一个元素
    }
    function chars(text) {
        // 把全空的文本去掉(全空的文本是不会被显显示的)
        text = text.replace(/\s/g, '')
        currentParent.children.push({
            text,
            type: TEXT_TYPE,
            parent: currentParent
        })
    }
    function end(tag) {
        stack.pop()
        currentParent = stack[stack.length - 1]
    }

    while (html) {
        // 如果textEnd 为0，说明是一个开始标签(<div>) 或一个结束标签(</div>)
        // 如果textEnd >0 说明就是文本的结束位置(aaa<div>)
        let textEnd = html.indexOf('<') //如果返回的索引是0，则说明是个标签，在开头

        if (textEnd == 0) {
            const startTagMatch = parseStartTag(); //开始标签的匹配结果

            if (startTagMatch) {
                // 如果是开始标签就跳过了
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            //到这里就是结束标签(如果是开始标签的话就被删掉 continue了)
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue;
            }
        }
        // 开始标签匹配 text
        if (textEnd > 0) {
            // 轮到了文本内容
            let text = html.substring(0, textEnd)
            if (text) {
                chars(text)
                advance(text.length)
            }
        }
    }
    return root
}
