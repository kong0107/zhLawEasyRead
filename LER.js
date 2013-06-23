LER = function(){
    var skippingTags = ["SCRIPT", "CODE", "TEXTAREA"]; ///< 也許應該設計成CSS selector的機制
    var rules = [];
    var lawInfos = {};  ///< 法規資訊，包含暱稱資訊

    if(true) { ///< set to true to enable debug messages
        var debugStartTime = (new Date).getTime();
        var debugOldTime = debugStartTime;
        var debug = function(str) {
            str = str ? (": " + str) : "";
            var debugNow = (new Date).getTime();
            console.log("LER (" + (debugNow - debugOldTime) + "/" + (debugNow - debugStartTime) + ")" + str);
            debugOldTime = debugNow;
        };
    }
    else var debug = function(){};

    /** 2013-06-22開始實作的又一種作法
      * （好啦我知道一直改核心演算法很不好）
      * 無論幾種要轉換的東西，一個 Text 節點即只處理一次
      * 用recursive DFS call
      */
    var parseElement = function(ele, inSpecial) {
        for(var next, child = ele.firstChild; child; child = next) {
            if(ele.tagName == 'A') inSpecial = 'A';
            next = child.nextSibling; ///< 因為ele.childNodes會變，所以得這樣
            switch(child.nodeType) {
            case 1: ///< Node.ELEMENT_NODE
                if(skippingTags.indexOf(child.tagName) >= 0) break;
                parseElement(child, inSpecial);
                break;
            case 3: ///< Node.TEXT_NODE
                isImmediateAfterLaw = false;    ///< 這行好像不應該寫在這..
                var arr = parseText(child.data, inSpecial);
                if(arr.length == 1 && arr[0] == child.data) break;
                for(var i = 0; i < arr.length; ++i) {
                    if(typeof arr[i] == "string")
                        arr[i] = document.createTextNode(arr[i]);
                    ele.insertBefore(arr[i], child);
                }
                ele.removeChild(child);
                break;
            default: break;
            }
        }
    };
    /** 處理純文字，回傳文字與節點夾雜的陣列
      * 第一個規則的比對碎片，會馬上被用第二個規則去比對與替換
      */
    var parseText = function(text, inSpecial, ruleIndex) {
        /// 先處理一些特殊或簡單的情形
        if(!ruleIndex) ruleIndex = 0;
        if(ruleIndex >= rules.length) return [text];
        var rule = rules[ruleIndex];
        if(text.replace(/\s/g, '').length < (rule.minLength ? rule.minLength : 2))
            return [text]; ///< 如果字數太少，就直接不處理。

        /// 由於RegExp可能有子pattern，故需用exec而不宜用split和match()
        var result = [];
        for(var match, pos = 0;
            (match = rule.pattern.exec(text)) != null;
            pos = match.index + match[0].length
        ) {
            /// 每次有比對到時，先把比對位置前面的碎片丟給下一個規則
            result.push.apply(result, parseText(text.substring(pos, match.index), inSpecial, ruleIndex + 1));
            /// 然後才處理實際比對到的東西（注意match是物件而非字串）
            result.push(rule.replace(match, inSpecial));
        }
        /// 處理最後一塊碎片
        result.push.apply(result, parseText(text.substr(pos), inSpecial, ruleIndex + 1));
        return result;
    }

    /** 處理條號與法規的對應
      * 如果條號緊接於法規名稱之後，則該條號即屬於該法規
      * 若否，而已設定了「預設法規」，那就歸屬於預設法規
      * 若亦無預設法規，則對應到前一個找到的法規
      * 若未曾找到過法規，那就不指定歸屬
      */
    var defaultLaw;     ///< 預設法規，由外部指定（通常是法規資料庫中特定法規的專頁時）
    var lastFoundLaw;
    var isImmediateAfterLaw;    ///< 目前判斷此值的機制欠佳...
    var setDefaultLaw = function(arg) {
        return defaultLaw = (typeof arg == "string") ? lawInfos[arg] : arg;
    };


    /** 比對的規則
      * 使用匿名函數設定初始值並回傳物件給rules.push
      * 實際push進入規則陣列的物件包含三個屬性：
      * \attribute pattern 正規表示式
      * \attribute replace 替換函數。第一引數為正規表示式的匹配物件，回傳字串與節點混雜的一維陣列
      * \attribute minLength 最短需要比對的字串長度。用於跳過一些不可能比對成功的情形
      */
    /// 法規名稱比對
    rules.push(function() {
        /** 讀取法規資訊，包含暱稱
          * 標點符號的略去還頗令人困擾，因為有些想留下的如：
          * * 總統副總統選舉罷免法（新 84.08.09 制定）
          * * 省（市）政府建設公債發行條例
          * * 國軍陣（死）亡官兵遺骸安葬及遺物處理辦法
          * * 高級中等以下學校及幼兒（稚）園教師資格檢定辦法
          * * 財政部與所屬國家行局公司董（理）事會暨總經理（局長）權責劃分辦法
          * * 中央銀行及中央存款保險股份有限公司現職金融檢查人員轉任行政院金融監督管理委員會及所屬機關比照改任官職等級及退撫事項辦法
          *
          * 偏偏也有一些不想留下的，例如：
          * * 中華民國與美利堅合眾國關於四十七年四月十八日、四十八年六月九日、四十九年八月三十日及五十年七月二十一日等次農業品協定之換文
          * * 核能研究所（中華民國的非營利機構）、芝加哥大學（美國阿崗國家實驗室運轉機構）及日本中央電力產業研究所三方合作交換計畫協議書（中譯本）
          * * 駐美國臺北經濟文化代表處與美國在台協會技術合作發展，發射並操作氣象，電離層及氣候之衛星星系觀測系統協議書第一號執行協定第二號修訂
          * * 駐美國台北經濟文化代表處與美國在台協會氣象預報系統發展技術合作協議第十七號執行辦法持續發展區域分析及預測系統及預警決策支援系統
          *
          * 但是，也許有使用者就是需要那些我不想留下的？
          */
        var lawNames = [];  ///< 生成比對用的表達式之用，用畢可刪
        for(var i = 0; i < pcodes.length; ++i) {
            var name = pcodes[i].name;
            if(name.length > 64) continue;
            if(/[A-Za-z，、「」]/.test(name)) continue;
            lawInfos[name] = pcodes[i]; ///< 理想上只需要編號，但是為了在遇到暱稱時也能顯示全名..
            lawNames.push(name.replace(/([\.\(\)])/g, "\$1")); ///< 加上脫逸字，因需轉成RegExp
        }
        for(var nick in aliases) {
            var name = aliases[nick];
            if(typeof lawInfos[name] == "undefined")
                throw new ReferenceError("law name " + name + " doesn't exist.");
            lawInfos[nick] = lawInfos[name]; ///< 指到同一個物件

            /// 之後也許可以用暱稱來做點什麼...
            //if(!lawInfos[name].nicks) lawInfos[name].nicks = [];
            //lawInfos[name].nicks.push(nick);

            lawNames.push(nick);
        }
        /// 由長至短排列（以避免遇到「刑法施行法」卻比對到「刑法」）
        lawNames.sort(function(a,b){return b.length-a.length});
        var pattern = new RegExp(lawNames.join('|'), 'g');

        var replace = function(match, inSpecial) {
            lastFoundLaw = lawInfos[match[0]];
            isImmediateAfterLaw = true;
            var node;
            if(inSpecial != 'A') {
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + lastFoundLaw.PCode);
            }
            else node = document.createElement("SPAN");
            node.setAttribute('title', lastFoundLaw.name);
            node.className = "LER_lawName";
            node.appendChild(document.createTextNode(match[0]));
            return node;
        };

        return {pattern: pattern, replace: replace, minLength: 2}; ///< 最短的是「民法」
    }());
    
    
    /** 條號比對－－支援多條文
      * 僅處理條文中提及多條文時的格式，例如行訴§18的「第十七條、第二十條至第二十二條、第二十八條第一項、第三項、第二十九條至第三十一條」
      * 「類」是為了支援所得稅法§14
      *
      * 這裡不處理：
      * * 全國法規資料庫的 "第 15-1 條"
      * * 立法院法律系統中，法規版本列表的 "第616之1, 624之1至624之8條"
      */
    rules.push(function() {
        var reNumber = "[\\d零一二三四五六七八九十百千]+";
        var reTypes = "[條項類款目]";
        var reSplitter = "[、,或及至]";
        var rePart = "(%number%)(%type%)(之(%number%))?".replace(/%number%/g, reNumber).replace(/%type%/, reTypes);
        var pattern = "(第" + rePart + ")+";
        pattern = pattern  + "(" + reSplitter + pattern + ")*";
        pattern = new RegExp(pattern, 'g');
        rePart = new RegExp(rePart, 'g');
        //reTypes = new RegExp(reTypes, 'g');
        reSplitter = new RegExp(reSplitter, 'g');
        //reNumber = new RegExp(reNumber, 'g');
        
        var replace = function(match, inSpecial) {
            var text = "";  ///< 簡化後的文字
            var SNo = "";   ///< 連結            
            reSplitter.lastIndex = 0;
            
            // 例如比對到 "第十八條之一第一項第九類、第二十六條第二款至第四款"，其執行結果為
            var parts = match[0].split(reSplitter);        //#=> ["第十八條之一第一項第九類", "第二十六條第二款", "第四款"]
            var glues = match[0].match(reSplitter);        //#=> [                         "、",               "至"       ]
            for(var i = 0; i < parts.length; ++i) {
                var scraps = parts[i].split(/第/g);        //#=> ["", "十八條之一", "一項", "九類"], ["", "二十六條", "二款"], ["", "四款"]
                for(var j = 1; j < scraps.length; ++j) {
                    rePart.lastIndex = 0;
                    var m = rePart.exec(scraps[j]);
                    var num = parseInt(m[1]);
                    switch(m[2]) {
                    case "條":
                        text += "§" + num;
                        if(i) SNo += (glues[i-1] == "至") ? "-" : ",";   ///< 處理連接詞
                        SNo += num;
                        break;
                    default:    ///< 之後要處理簡稱，例如「項」是簡記為羅馬數字，但也要允許使用者選擇喜歡的簡記方式
                        text += "第" + num + m[2];
                    }
                    if(m[3]) {  ///< 理論上只在「條」的情況出現
                        num = parseInt(m[4]);
                        text += "-" + num;
                        SNo += "." + num;
                    }
                }
                
                if(i == parts.length - 1) break;    ///< 處理連接詞
                text += ((glues[i] == ",") ? "" : " ") + glues[i] + " ";
            }

            /// 處理預設法規。機制參閱此處變數宣告之處
            var law = (isImmediateAfterLaw && match.index == 0 || !defaultLaw) ? lastFoundLaw : defaultLaw;
            isImmediateAfterLaw = false;

            var node;
            if(inSpecial != 'A' && !!law && SNo) {  ///< 如果是「前條第一款」，那就還不會加上連結
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                var href = "http://law.moj.gov.tw/LawClass/Law";
                if(/[,-]/.test(SNo)) href += "SearchNo.aspx?PC=" + law.PCode + "&SNo=" + SNo;   ///< 多條
                else href += "Single.aspx?Pcode=" + law.PCode + "&FLNO=" + SNo;     ///< 單條
                node.setAttribute('href', href);
                node.setAttribute('title', law.name + "\n" + match[0]);
            }
            else {
                node = document.createElement("SPAN");
                node.setAttribute('title', match[0]);
            }
            node.className = "LER_artNum";
            node.appendChild(document.createTextNode(text));
            return node;
        };
        return {pattern: pattern, replace: replace, minLength: 3}; ///< 最短的是「第一條」
    }());

    /** 處理到全國法規資料庫的 "第 15-1 條"
      */
    rules.push(function() {
        var pattern = /第\s*(\d+)(-(\d+))?\s*條/g;
        var replace = function(match, inSpecial) {
            var num1 = parseInt(match[1]);
            var text = "§" + num1;
            var flno = num1;
            if(match[3]) {    /// 處理全國法規資料庫的「第 15-1 條」，不會是中文數字
                text += match[2];
                flno += "." + match[3];
            }
            /// 處理預設法規。機制參閱此處變數宣告之處
            var law = (isImmediateAfterLaw && match.index == 0 || !defaultLaw) ? lastFoundLaw : defaultLaw;
            var node;
            if(inSpecial != 'A' && !!law) {
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=" + law.PCode + "&FLNO=" + flno);
                node.setAttribute('title', law.name + "\n" + match[0]);
            }
            else {
                node = document.createElement("SPAN");
                node.setAttribute('title', match[0]);
            }
            node.className = "LER_artNum";
            node.appendChild(document.createTextNode(text));
            return node;
        };
        return {pattern: pattern, replace: replace, minLength: 3}; ///< 最短的是「第一條」
    }());

    return {
        skippingTags: skippingTags,
        setDefaultLaw: setDefaultLaw,
        lawInfos: lawInfos,
        parse: parseElement,
        debug: function(varName) {return eval(varName);},
        debugTime: function(str) {debug(str);}
    };
}();
LER.debugTime("initialization");