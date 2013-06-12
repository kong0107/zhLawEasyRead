/** 使 window.parseInt 支援中文數字
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
 *  Algorithm: 把「五十六萬三百零四」轉成 "(5*10+6)*10000+3*100+0+4" 然後eval()
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


/** 使 Node 物件支援「將一個節點代換為一串節點」
 *
 *  Bugs: 替換陣列中如果包含原節點，原節點仍會被移除
 */
try {
    (function() {
        var emptyTN = document.createTextNode("");
        document.body.appendChild(emptyTN);
        document.body.replaceChild([], emptyTN); /// 看看是否已支援此功能
        /// emptyTN 應該不用removeChild，只要 Node.prototype.joinTexts 就好
    })();
}
catch(e) {
    Node.prototype.replaceChild = function() {
        var orig = Node.prototype.replaceChild;
        return function() {
            var new_obj = arguments[0];
            var old_node = arguments[1];
            if(!(old_node instanceof Node)          /// 意外用法
                || new_obj instanceof Node          /// 原本用法
            ) return orig.apply(this, arguments);   /// 都丟給原函數
        
            if(typeof new_obj != "object")  /// 非物件的就轉成陣列
                new_obj = [ new_obj.toString() ];
            else if(new_obj.length == 1 && new_obj[0].isSameNode(old_node)) 
                return; /// 陣列中只有自己的話，那就不用更換了
            
            /* 見後述的無窮迴圈困境，這裡也會發生
               也許是正規表示法又對新的節點執行的緣故？
            var pos = new_obj.indexOf(old_node);
            if(pos >= 0) new_obj[pos] = old_node.cloneNode(true);*/
            
            var locator = document.createTextNode("");
            this.insertBefore(locator, old_node);
            for(var i = 0; i < new_obj.length; ++i) {
                var cur = new_obj[i];
                if(!(cur instanceof Node)) cur = document.createTextNode(cur);
                this.insertBefore(cur, locator);
            }
            this.removeChild(locator);
            /*if(new_obj.indexOf(old_node) < 0)*/ this.removeChild(old_node);
            /** 應該是把上述判斷式的註解取消即可
             *  但實際這樣做時，卻會陷入無窮迴圈
             *  猜測是 Element#replaceChildren 那邊的遞迴
             */
            return old_node;
        }
    }();
}


/** 仿字串的replace()方法並更新自身
 */
Text.prototype.replaceSelf = function(pattern, replacement) {
    this.data = (typeof pattern == "string" && typeof replacement == "string")
        ? this.data.split(pattern).join(replacement) /// 因為每個都想替換，只好這樣
        : this.data.replace(pattern.setGlobal(), replacement)
    ;
    return this;
};

/** 唔，其實不是setter，而是回傳有設global flag的物件
 *  嘗試覆寫RegExp的建構子，未成功
 *  嘗試用__defineSetter__，但並不知道其property name
 */
RegExp.prototype.setGlobal = function() {
    if(this.global) return this;
    var attr = "g";
    if(this.ignoreCase) attr += "i";
    if((typeof RegExp.prototype.multiline != "undefined") && this.multiline)
        attr += "m";
    return new RegExp(this.source, attr);
};

/** 模擬字串的replace，但回傳值、第二個引數不同；不會更新自身
 *  \param replacement 字串或函數。如為函數，其接收之引數與文字物件的replace()類似相同，但：
 *      最後一個引數不是全字串，而是節點
 *      replacement的回傳值不是字串，而是節點陣列
 *      關於字串的replace，參閱http://www.w3school.com.cn/js/jsref_replace.asp
 *  \return 節點陣列
 */
Text.prototype.replace = function(pattern, replacement) {
    if(!this.data.length) return [];
    var splitted = this.data.split(pattern);
    if(splitted.length == 1) return [this];
    var result = [splitted.shift()];
    
    if(typeof replacement == "string") {
        var str = this.data.split(pattern).join(replacement);
        return [document.createTextNode(str)];
    }
    if(typeof replacement != "function") 
        throw new TypeError("replacement cannot be " + (typeof replacement));
    
    if(pattern instanceof RegExp) {
        var match;
        pattern = pattern.setGlobal();
        pattern.lastIndex = 0;
        while((match = pattern.exec(this.data)) != null) {
            match.push(match.index);
            match.push(this);
            result = result.concat(replacement.apply(this, match)); 
            /// match 的 index 和 input 傳過去後會自己消失
            result.push(splitted.shift());
        }
    }
    else if(typeof pattern == "string") { 
        var match = [pattern, -1, this];
        for(var pos = 0; 
            (pos = this.data.indexOf(pattern, pos)) >= 0; 
            pos += pattern.length
        ) {
            /// 演算法同上，只是取得match的方式有點醜
            match[1] = pos;
            result = result.concat(replacement.apply(this, match));
            result.push(splitted.shift());
        }
    }    
    else throw new TypeError("pattern cannot be " + (typeof pattern));
    
    for(var i = 0; i < result.length; ++i) /// 陣列中的元素都是節點
        if(!(result[i] instanceof Node)) result[i] = document.createTextNode(result[i]);    
    return result;
}

/** 把子節點中，連續的純文字部分合併
 *  \param recursive 預設為不會遞迴呼叫
 */
Node.prototype.joinTexts = function(recursive) {
    if(arguments.length == 0) recursive = false;
    for(var i = 0; i < this.childNodes.length; ++i) {
        var cur = this.childNodes[i];
        if(cur.nodeType != Node.TEXT_NODE) {
            if(recursive) cur.joinTexts();
            continue;
        }
        var next = cur.nextSibling;
        while(next && next.nodeType == Node.TEXT_NODE) {
            cur.data += next.data;
            this.removeChild(next);
            next = cur.nextSibling;
        }
    }
    return this;
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
        : function(){ throw new TypeError; }
    ;
    return function() {
        var pattern = arguments[0];
        var replacement = arguments[1];
        var recursive = (arguments.length > 2) ? arguments[2] : true;
        if( /// 不支援的就丟給原本的函數
            arguments.length < 2 || arguments.length > 3
            || (typeof pattern != "string" && !(pattern instanceof RegExp))
            || (typeof replacement != "string" && typeof replacement != "function")
        ) return orig.apply(this, arguments);
        
        var nodes = this.childNodes;
        for(var i = 0; i < nodes.length; ++i) {
            if(nodes[i].nodeType != Node.TEXT_NODE) {            
                if(recursive)
                    nodes[i].replaceChildren(pattern, replacement, recursive);
                continue;
            }
            var nodeArr = nodes[i].replace(pattern, replacement);
            if(nodeArr.length == 1 && nodeArr[0].isSameNode(nodes[i])) continue;
            this.replaceChild(nodeArr, nodes[i]);
        }
        return this;
    }
}();