/// IE 沒有 Node 類別；不過這個作法應該是很不好？
if(typeof Node == "undefined") Node = Element;

/** 使 Node 物件支援「將一個節點代換為一串節點」
 * \param new_obj 新物件，類型可為：
 *      * 節點：由原函數處理。
 *      * 可轉為文字的不可數物件：轉為文字節點，仍由原函數處理。
 *      * 可數物件：將每個元素依序插入要被替換的位置
 * \param old_node 舊節點，需為節點。
 * \return 舊節點，無論實際上有無被移除
 */
try {
    /// 先測試是否支援此功能，如果不支援才需要宣告
    (function() {
        var emptyTN = document.createTextNode("");
        document.body.appendChild(emptyTN);
        document.body.replaceChild([], emptyTN);
    })();
}
catch(e) {
    Node.prototype.replaceChild = function() {
        var orig = Node.prototype.replaceChild;
        return function(new_obj, old_node) {
            if(!(old_node instanceof Node)          /// 意外用法
                || new_obj instanceof Node          /// 原本用法
            ) return orig.apply(this, arguments);   /// 都丟給原函數
        
            if(typeof new_obj != "object" || typeof new_obj.length != "number")  {
                try {
                    /// 非物件的，或是不可數的，就轉成文字節點，依舊丟給原函數
                    arguments[0] = document.createTextNode(new_obj.toString());
                    return orig.apply(this, arguments);
                }
                catch(e) {throw new TypeError("new_obj cannot convert into string.");}
            }
            else if(new_obj.length == 1 && new_obj[0].isSameNode(old_node)) 
                return old_node; /// 陣列中只有自己的話，那就不用更換了
            
            /* 這裡才是核心
              直覺的演算法是：將全部的都插入在原本的前面，然後把原本的刪除
              但這樣遇到「如果原本的仍在陣列中」的狀況恐不理想
              故先新增一定位用的TextNode、全部插在其前，最後再將之刪除
              不過
            */
            var locator = document.createTextNode("");
            this.insertBefore(locator, old_node);
            for(var i = 0; i < new_obj.length; ++i) {
                var cur = new_obj[i];
                if(!(cur instanceof Node)) cur = document.createTextNode(cur);
                this.insertBefore(cur, locator);
            }
            this.removeChild(locator);
            if(new_obj.indexOf(old_node) < 0) this.removeChild(old_node);
            return old_node;
        }
    }();
}

/** 唔，其實不是setter，而是回傳有設global flag的物件
 *  嘗試覆寫RegExp的建構子，未成功
 *  嘗試用__defineSetter__，但並不知道其property name
 */
if(!RegExp.prototype.setGlobal) {
    RegExp.prototype.setGlobal = function() {
        if(this.global) return this;
        var attr = "g";
        if(this.ignoreCase) attr += "i";
        if((typeof RegExp.prototype.multiline != "undefined") && this.multiline)
            attr += "m";
        return new RegExp(this.source, attr);
    };
}

/** 仿字串的replace()方法並更新自身
 *  本專案中似無用到
 */
if(!Text.prototype.replaceSelf) {
    Text.prototype.replaceSelf = function(pattern, replacement) {
        if(pattern instanceof RegExp) 
            this.data = this.data.replace(pattern.setGlobal(), replacement);
        else if(typeof pattern == "string") {
            if(typeof replacement == "string")
                this.data = this.data.split(pattern).join(replacement);
            else if(typeof replacement == "function") /// 也許該改寫成把配對到的位置丟給replacement
                this.data = this.data.split(pattern).join(replacement(pattern));
            else throw new TypeError("Text#replaceSelf: replacement cannot be " + typeof replacement);
        }
        else throw new TypeError("Text#replaceSelf: pattern cannot be " + typeof pattern);
        return this;
    };
}

/** 模擬字串的replace，但回傳值與第二個引數不同；不會更新自身
 *  \param replacement 字串或函數。如為函數，其接收之引數與文字物件的replace()類似相同，但：
 *      最後一個引數不是全字串，而是節點
 *      replacement的回傳值不是字串，而是節點陣列
 *      關於字串的replace，參閱http://www.w3school.com.cn/js/jsref_replace.asp
 *  \return 節點陣列
 *
 *  雖然也可使replacement可以是Node或NodeList，但恐怕要先決定：第一次比對到時，要用cloneNode還是直接replaceChild？
 */
Text.prototype.replace = function() {    
    var orig = Text.prototype.replace
        ? Text.prototype.replace
        : function() { throw new TypeError("Text#replace"); }
    return function(pattern, replacement) {
        //console.log("Text#replace(" + this.data.replace(/\n/g, '\\n') + ")");
        /// 型態檢查
        var replaceType = typeof replacement;
        if(replaceType != "string" && replaceType != "function") 
            return orig.apply(this, arguments); 
        ///< 因為可能有其他外掛用不同的方式宣告過此函數，故如此宣告
            
        /// 處理一些簡單的情形
        if(!this.data.length) return [];
        var splitted = this.data.split(pattern);
        if(splitted.length == 1) return [this];
        var result = [splitted.shift()];
        
        /// 主要演算法
        if(pattern instanceof RegExp) {
            pattern = pattern.setGlobal();
            pattern.lastIndex = 0;
            if(replaceType == "string") {
                var str = this.data.replace(pattern, replacement);
                return [document.createTextNode(str)];
            }
            /// pattern如果有子pattern，會造成split和match的回傳結果包含子pattern，故需如下
            result = [];
            for(var match, pos = 0;
                (match = pattern.exec(this.data)) != null;
                pos = match.index + match[0].length
            ) {
                result.push(document.createTextNode(this.data.substring(pos, match.index)));
                match.push(match.index);
                match.push(this);
                
                var replaced = replacement.apply(this, match);
                switch(typeof replaced) {
                case "undefined": continue;
                case "string": replaced = [document.createTextNode(replaced)]; ///< no break
                default: if(replaced instanceof Node) replaced = [replaced];
                }
                for(var i = 0; i < replaced.length; ++i) result.push(replaced[i]);
                ///< 原本想用Array#concat，但其遇到NodeList時並不是如上運作。
            }
            result.push(document.createTextNode(this.data.substr(pos)));
        }
        else if(typeof pattern == "string") { 
            if(replaceType == "string") {
                var str = this.data.split(pattern).join(replacement);
                return [document.createTextNode(str)];
            }
            var match = [pattern, -1, this];
            for(var pos = 0; 
                (pos = this.data.indexOf(pattern, pos)) >= 0; 
                pos += pattern.length
            ) {
                /// 演算法類似上面，只是取得match的方式有點醜；應再改為如上防錯機制
                match[1] = pos;
                result = result.concat(replacement.apply(this, match));
                result.push(splitted.shift());
            }
        }    
        else throw new TypeError("pattern cannot be " + (typeof pattern));
            
        for(var i = 0; i < result.length; ++i) /// 陣列中的元素都是節點
            if(!(result[i] instanceof Node)) 
                result[i] = document.createTextNode(result[i]);    
        return result;
    };
}();

/** 把子節點中，連續的純文字部分合併
 *  \param recursive 預設為不會遞迴呼叫
 */
if(!Node.prototype.joinTexts) {
    Node.prototype.joinTexts = function(recursive) {
        if(arguments.length == 0) recursive = false;
        for(var i = 0; i < this.childNodes.length; ++i) {
            var cur = this.childNodes[i];
            switch(cur.nodeType) {
            case 1: ///< Node.ELEMENT_NODE
                if(recursive) cur.joinTexts();
                continue;
            case 3: ///< Node.TEXT_NODE
                var next = cur.nextSibling;
                while(next && next.nodeType == 3) {
                    cur.data += next.data;
                    this.removeChild(next);
                    next = cur.nextSibling;
                }
                break;
            }
        }
        return this;
    }
}

/** 替換子節點中的純文字部分
 *  針對每一個子節點，如其為文字節點，呼叫文字物件的 replace(pattern, replacement)
 *  \param pattern 字串或正規表達式，用法同於字串物件的replace方法的第一個參數
 *  \param replacement 字串或函數。如為函數，其接收之引數與文字物件的replace()相同，但：
 *      最後一個引數不是全字串，而是包含全字串的節點
 *      回傳值不是字串，而是節點陣列，將用於 Node.prototype.replaceChild
 *      如果僅需將純文字換為純文字，應用Text的replace
 *  \param recursive 預設為真，即使每一非文字之子節點呼叫本函數
 */
Element.prototype.replaceChildren = function() {
    var orig = Element.prototype.replaceChildren 
        ? Element.prototype.replaceChildren 
        : function(){ 
            console.log(arguments);
            throw new TypeError("Element#replaceChildren"); 
        }
    ;
    return function(pattern, replacement, skippingTags, recursive) {
        //console.log("Element#replaceChildren");
        if(arguments.length < 3) skippingTags = ["SCRIPT", "CODE", "TEXTAREA"];
        if(arguments.length < 4) recursive = true;
        if( /// 不支援的就丟給原本的函數
            arguments.length < 2 || arguments.length > 4
            || !(skippingTags instanceof Array)
            || (typeof pattern != "string" && !(pattern instanceof RegExp))
            || (typeof replacement != "string" && typeof replacement != "function")
        ) return orig.apply(this, arguments);        
        
        for(var cur = this.firstChild, next; cur; cur = next) {
            next = cur.nextSibling;
            switch(cur.nodeType) {
            case 1: ///< Node.ELEMENT_NODE:
                if(recursive && skippingTags.indexOf(cur.tagName) < 0)
                    cur.replaceChildren(pattern, replacement, skippingTags, recursive);
                continue;
            case 3: ///< Node.TEXT_NODE:
                var nodeArr = cur.replace(pattern, replacement);
                if(nodeArr.length == 1 && nodeArr[0] === cur) continue;
                this.replaceChild(nodeArr, cur);
                break;
            }
        }
        return this;
    }
}();

/** 判斷是不是某標籤的後代節點
  * Examples:
  * * node.isDecendantOfTag("pre");
  * * node.isDecendantOfTag("pre", "script");
  * * node.isDecendantOfTag(["pre", "script"]);
  */
Node.prototype.isDescendantOfTag = function() {
    var orig = Node.prototype.isDescendantOfTag
        ? Node.prototype.isDescendantOfTag
        : function(){ throw new TypeError("input not string or array of strings"); }
    ;
    return function(tag) {
        if(arguments.length == 0 || typeof arguments[0].length == "undefined")
            return orig.apply(this, arguments); ///< 不知怎處理的就給原函數
        
        if(typeof arguments[0] != "string") arguments = arguments[0];
        for(var i = 0; i < arguments.length; ++i) 
            arguments[i] = arguments[i].toString().toUpperCase();
        for(var ancestor = this.parentElement;
            ancestor != null; 
            ancestor = ancestor.parentElement
        ) {
            /// 唔...arguments沒有indexOf方法
            for(var i = 0; i < arguments.length; ++i)
                if(ancestor.tagName == arguments[i]) return true;
        }
        return false;
    };
}();

/** 判斷是否在某節點之前
  * 比對兩個節點的列祖列宗，遇到相同的話，再看相同之前的那個的兄弟關係。
  *
  * 也可以另外宣告下述函數加以利用，但亦有下述難處且不確定其他有同名函數的framework如何設計，故而作罷：
  * Node.prototype.ancestors		需決定parentNode是首還是尾
  * Node.prototype.comparePosition	需決定「在前」是正還是負；還有「不在同一個樹」要回傳啥。
  * Node.prototype.DFSOrder			DFS的順序來排序即是本需求，但要在結構樹變動時亦隨之更動頗麻煩
  */
Node.prototype.isBefore = function() {
	var orig = Node.prototype.isBefore
		? Node.prototype.isBefore
		: function() {throw new TypeError("Argument list must have exactly one node only.");}
	;
	return function(node) {
		if(arguments.length != 1 || !(node instanceof Node)) orig.apply(this, arguments);
		if(this === node) return false;	///< FireFox 沒有 isSameNode
		var pos, a, pre;
		var ancestors = [this];
		for(a = this.parentNode; a; a = a.parentNode) ancestors.push(a);
		if(ancestors.indexOf(node) != -1) return false;
		for(pre = node, a = pre.parentNode; a; pre = a, a = a.parentNode) 
			if((pos = ancestors.indexOf(a)) >= 0) break;
		if(!a) return false; /// 亦即沒有相同的祖宗
		if(!pos) return true;
		for(var s = a.firstChild; s; s = s.nextSibling) {
			if(s === pre) return false;
			if(s === ancestors[pos-1]) return true;
		}
	};
}();

/** 將XML字串轉為NodeList
  * 原本的 DOMParser#parseFromString 必須輸入恰有一根節點的XML，
  * 這裡只是最外面先包一個隨便的標籤，轉完後再求其子節點列表。
  * 並不會檢查是否是合法的HTML標籤。
  * 實際把東西塞進DOM tree的時候，似乎都沒有元素性質（如連節），故專案中未使用
  */
if(!window.parseXMLtoNodeList) {
    parseXMLtoNodeList = function() {
        var domParser = new DOMParser();
        return function(xml) {
            return domParser.parseFromString("<xml>" + xml + "</xml>", "text/xml").lastChild.childNodes;
        }
    }();
}

/** 用innerHTML取得NodeList
  * 非正規的方法，而且似乎會一直產生沒用到的DIV；本專案尚無用到。
  */
if(window.createNodeList) {
	createNodeList = function(html) {
		var pseudo = document.createElement("DIV");
		pseudo.innerHTML = html;
		return pseudo.childNodes;
	};
}

/** 將另一物件的所有特性都囊括於己
  * 未確認 __defineGetter__ 弄出來的那些會發生甚麼事
  */
/*Object.prototype.merge = function() {
    var orig = Object.prototype.merge
        ? Object.prototype.merge
        : function() {throw new TypeError("parameter not object");}
    ;
    return function(target) {
        if(arguments.length != 1 || typeof target != "object")
            return orig.apply(this, arguments);
        for(var attr in target)
            this[attr] = target[attr];
    };
}();*/

/** 引入JavaScript專用的小函數
 */
/*function includeJS(path) {
    var node = document.createElement("SCRIPT");
    node.type = "text/javascript";
    node.src = path;
    node.onload = function(){
        var url = path
        return function() {
            alert('loaded ' + url);
        }
    }();
    document.getElementsByTagName('head')[0].appendChild(node);
}*/

/** 使 window.parseInt 支援中文數字
 *  Algorithm: 把「五十六萬三百零四」轉成 "(5*10+6)*10000+3*100+0+4" 然後eval()
 *  Examples:
 *  * parseInt("七五三三九六七");   //=> 7533967
 *  * parseInt("負第十五條");       //=> -15       // 移除不支援的字
 *  * parseInt("百萬");             //=> 1000000  // 支援自動補「一」
 *  * parseInt("負兩千貳百二十兩"); //=> -2220     // 末尾的「兩」字當作意外傳入的量詞
 *  * parseInt("兩千貳百二十兩萬"); //=> 22220000 // 非末尾的「兩」字當作數字
 *
 *  Notes:
 *  * 只會處理「原本的parseInt沒能處理」的部分，故：
 *      * parseInt("三4"); //=> 3
 *      * parseInt("4三"); //=> 4
 *  * 傳入正確的字串仍是呼叫者的責任，「重量兩兩」和「兩兩成行」都會回傳2。
 *  * 未確認溢位問題
 *  * 未處理簡體字
 *  * 未支援「廿」、「卅」等
 *  * 未支援小數
 * 
 */
if(parseInt("一千一百十一")!=1111) { ///< 如果還不支援，才需要宣告
    parseInt = function() {
        var orig = parseInt;
        /**
         *  命名規則：
         *  * one:  數字「一」
         *  * ones: 個位數
         *  * tens: 十進制
         *  * wans: 萬進制
         *  * re:   正規表示式
         */
        
        var onesH = [
            "０零○〇", "一壹ㄧ",
            "二貳兩", "三參", "四肆", "五伍",
            "六陸", "七柒", "八捌", "九玖"
        ]; /// "兩"字當量詞而被意外傳入時，後面會處理
        var ones = onesH.join("");
        var tens = "十百千拾佰仟";
        var wans = "萬億兆京垓秭穰溝澗正載極"; ///< 參閱WikiPedia條目〈中文數字〉
        
        var reOnesH = [];
        for(var i = 0; i < 10; ++i) reOnesH[i] = new RegExp("["+onesH[i]+"]", "g");
        var reOnes = new RegExp("[" + ones + "]", "g");
        var reTens = new RegExp("[" + tens + "]", "g");
        var reWans = new RegExp("([^負" + wans + "]+)([" + wans + "])", "g");
        
        var rePreOne = new RegExp("^([" + tens + wans + "])", "g"); ///< 句首補「一」
        var reInnerOne = new RegExp("([負零" + tens + wans + "])([" + tens + "])", "g"); ///< 處理如「二萬零十五」
        var reAllOnes = new RegExp("^負?["+ones+"]+$", "g");
        var reNonSupported = new RegExp("[^負"+ones+tens+wans+"]", "g");
        
        return function() {
            var result = orig.apply(this, arguments);
            if(!isNaN(result)) return result; ///< 如果是舊函數已支援的情形，那就回傳就函數的結果
            var str = arguments[0].replace(reNonSupported, ""); /// 移除不支援的字（包含 \d 喔）
            str = str.replace(/兩$/, ""); /// 移除末尾的「兩」字
            reAllOnes.lastIndex = 0;
            if(reAllOnes.test(str)) { /// 若均是零到九，直接一對一轉換
                str = str.replace(/^負/, "-");
                for(var i = 0; i < 10; ++i) {
                    reOnesH[i].lastIndex = 0;
                    str = str.replace(reOnesH[i], String(i));
                }
                return orig(str, 10);
            }
            /// 若有零到九以外的文字，才處理這裡
            reOnes.lastIndex = reTens.lastIndex = reWans.lastIndex = 0;
            rePreOne.lastIndex = reInnerOne.lastIndex = 0;
            str = str.replace(rePreOne, "一$1").replace(reInnerOne, "$1一$2");
            str = str.replace(reWans, function(match, belowWan, wan) {
                return "+(" + belowWan + ")*Math.pow(10000," + (wans.indexOf(wan)+1) + ")"
            }).replace(reTens, function(match) {
                return "*" + [10, 100, 1000][tens.indexOf(match)%3];
            }).replace(reOnes, function(match) {
                for(var i = 0; i < 10; ++i)
                    if(onesH[i].indexOf(match) >= 0)
                        return "+" + i;
            });
            str = str.replace(/^負(.*)/, "-($1)");
            try { return eval(str); }
            catch(e) {return NaN;}
        };
    }();
}