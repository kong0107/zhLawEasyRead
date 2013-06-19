/** 
  * 尚待確認：速度門檻是法規數量還是演算法？
  */
LER = function(){
    var rules = [];     ///< 比對規則與替換函數
    var lawInfos = {};  ///< 法規資訊，包含暱稱資訊
    var skippingTags = ["SCRIPT", "CODE", "TEXTAREA"]; ///< 也許應該設計成CSS selector的機制
    
    /// 法規名稱比對
    rules.push(function() {
        var lawNames = [];  ///< 生成比對用的表達式之用，用畢可刪
        
        /** 處理全國法規資料庫
          * 標點符號的略去還頗令人困擾，因為有些想留下的如：
          * * 總統副總統選舉罷免法（新 84.08.09 制定）
          * * 省（市）政府建設公債發行條例
          * * 國軍陣（死）亡官兵遺骸安葬及遺物處理辦法
          * * 高級中等以下學校及幼兒（稚）園教師資格檢定辦法
          * * 財政部與所屬國家行局公司董（理）事會暨總經理（局長）權責劃分辦法
          * * 中央銀行及中央存款保險股份有限公司現職金融檢查人員轉任行政院金融監督管理委員會及所屬機關比照改任官職等級及退撫事項辦法
          *
          * 但偏偏也有一些不想留下的，例如：
          * * 中華民國與美利堅合眾國關於四十七年四月十八日、四十八年六月九日、四十九年八月三十日及五十年七月二十一日等次農業品協定之換文
          * * 核能研究所（中華民國的非營利機構）、芝加哥大學（美國阿崗國家實驗室運轉機構）及日本中央電力產業研究所三方合作交換計畫協議書（中譯本）
          * * 駐美國臺北經濟文化代表處與美國在台協會技術合作發展，發射並操作氣象，電離層及氣候之衛星星系觀測系統協議書第一號執行協定第二號修訂
          * * 駐美國台北經濟文化代表處與美國在台協會氣象預報系統發展技術合作協議第十七號執行辦法持續發展區域分析及預測系統及預警決策支援系統
          * 
          * 改寫下述迴圈即可檢視那些落落長的法規名稱
          */
        for(var i = 0; i < pcodes.length; ++i) {
            var name = pcodes[i].name;
            //if(name.length > 64) continue; ///< 也許本專案有機會讓關心國際法的網友用到....
            if(/[A-Za-z，、「」]/.test(name)) continue;
            lawInfos[name] = {pcode: pcodes[i].PCode};
            lawNames.push(name.replace(/([\.\(\)])/g, "\$1")); ///< 加上脫逸字，因需轉成RegExp
        }
        
        /** 處理法規暱稱
          * 刪除本段亦可正常運作
          * 每個pair變成： "name": {pcode: string, fullName: string, nicknames: [string, ...]}
          */
        //if(typeof aliases != "object") var aliases = {};
        for(var nick in aliases) {
            var name = aliases[nick];
            if(typeof lawInfos[name] == "undefined") 
                throw new ReferenceError("law name " + name + " doesn't exist.");
            lawInfos[nick] = lawInfos[name]; ///< 指到同一個物件
            if(!lawInfos[name].full) lawInfos[name].fullName = name; ///< 有時會有簡稱的簡稱，例如	「刑施」=>「刑法施行法」=>「中華民國刑法施行法」
            if(!lawInfos[name].nicknames) lawInfos[name].nicknames = [];
            lawInfos[name].nicknames.push(nick);
            lawNames.push(nick);
        }        
        
        /// 由長至短排列（以避免遇到「刑法施行法」卻比對到「刑法」），然後轉成正規表示式
        lawNames.sort(function(a,b){return b.length-a.length});
        var pattern = new RegExp(lawNames.join("|"), 'g');
        delete lawNames; ///< 沒用了（JS有garbage回收系統嗎？）
    
        var replace = function(match, index, input) {
            var info = lawInfos[match];
            var node;
            if(!input.isDescendantOfTag('A')) {
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + info.pcode);
            }
            else node = document.createElement("SPAN");
            node.setAttribute('title', info.fullName ? info.fullName : match);
            node.className = "LER_lawName";
            node.appendChild(document.createTextNode(match));
            return node;
        };
        
        return {pattern: pattern, replace: replace};
    }());
    
    /** 條號文字替換
      * 僅支援單一條號，且還沒加上連結
      * 目前規畫：往前找最接近的法規名稱的node。問題是：何謂「往前找」？效率如何？
      */
    rules.push(function() {
        var retNumber = "[\\d零一二三四五六七八九十百千]+";
        var retArticle = "第\\s*(%number%)\\s*條(\\s*之\\s*(%number%))?".replace(/%number%/g, retNumber);
        var pattern = new RegExp(retArticle, 'g');    
        var replace = function(match, num1, sub, num2, index, input) {
            if(input.isDescendantOfTag(skippingTags)) return [document.createTextNode(match)];
            var text = "§" + parseInt(num1);
            if(typeof num2 != "undefined") text += "-" + parseInt(num2);
            var node;
            if(!input.isDescendantOfTag('A')) {
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                //node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=" + pcode + "&FLNO=" + flno);
            }
            else node = document.createElement("SPAN");
            node.setAttribute('title', match);
            node.className = "LER_artNum";
            node.appendChild(document.createTextNode(text));
            return node;
        };    
        return {pattern: pattern, replace: replace};
    }());
    
    return {
        debug: function(varName) {return eval(varName);},
        skippingTags: skippingTags, ///< 要讓使用者能夠自己設定要跳過的規則
        parseAll: function() {
            for(var i = 0; i < rules.length; ++i) {
                document.body.replaceChildren(rules[i].pattern, rules[i].replace, skippingTags, true);
            }
            document.body.joinTexts();
        }
    };
}();