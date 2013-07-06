(function(){
    if(typeof LER != "object" || !LER.setDefaultLaw) return;

    /// 判斷「預設法規」
    var pages = ["All", "Single", "AllPara", "SearchNo", "SearchContent", "History"];
    var match = document.location.pathname.match(/^\/LawClass\/Law(\w+).aspx/);
    if(!match || pages.indexOf(match[1]) < 0) return;
    LER.setDefaultLaw(document.getElementById("Content").getElementsByTagName('A')[1].lastChild.data.replace(/\s/g, ''));
    
    /** 在法規名稱處加上一個anchor
      * 以找「第一個TH標籤」實作，後續或許可以有其他應用。
      */
    var firstTH = document.getElementsByTagName("TH")[0];
    if(firstTH) 
        firstTH.innerHTML = '<a name="firstTH">' + firstTH.innerText + '</a>';
        
    /** 內嵌時，把header/footer拿掉
      * 但應該要留下<form />
      */
    if(window != top) {
        document.body.replaceChild(document.getElementById("mainFrame_body"), document.body.lastElementChild);
    }
        
    /** 利用條文表格左方的空間
      */
    var tla = document.querySelector(".TableLawAll");
    if(tla) {
        tla = tla.parentNode.parentNode;
        if(tla.childElementCount > 1) {
            tla.removeChild(tla.firstElementChild);
            tla.firstElementChild.colSpan = 2;
        }
    }
    
    /** 處理把全國法規資料庫的斷行排版
      * 嘗試排版承接層式表單（如`ly.js`）
      * 處理中
      */
    var lineWidth = 32;
    var stratums = [
        {
            "name": "paragraphs",       ///< 用於CSS
            "ordinal": /^(?! )/   ///< 此階層的序數文字，「不能」是global
        },
        {
            "name": "categories",
            "ordinal": /^第[一二三四五六七八九十]+類：/
        },
        {
            "name": "subparagraphs",
            "ordinal": /^\s*[○一二三四五六七八九十]+(、|　|  )/  ///< 憲法裡的「款」有時是全形空格，有時是兩個半形空格
        },
        {
            "name": "items",
            "ordinal": /^\s*[\(（][一二三四五六七八九十]+[\)）]/
        },
        {
            "name": "subitems",
            "ordinal": /^\s+\d+\./
        },
        {
            "name": "subsubitems",
            "ordinal": /^\s+（\d+）/   ///< 全形括號（與立法院不同）、半形數字
        }
    ];
    var pres = document.getElementsByTagName("PRE");
    for(var i = 0; i < pres.length;) {    
        var row = pres[i].parentNode.parentNode;
        if(row.childElementCount != 3) {
            /** 只處理條文，不處理分區（編章節）的文字
              * 因為 Node#replaceChild 會改變 NodeList，故 ++i 的位置與一般 for 迴圈不同
              */
            ++i;        
            continue;   
        }        
        /// 增加左方的空間
        row.firstElementChild.setAttribute("width", "");
        
        var lines = pres[i].innerText.split("\n");   ///< 記得最後一行是空字串喔
        var html = "<li>";
        var depthArr = [];
        for(var j = 0; j < lines.length; ++j) {
            var endDetect = /(：|。|（刪除）)$/.exec(html);
            if(endDetect) {
                var stratum = -1;
                for(var k = stratums.length - 1; k >= 0; --k) {
                    if(stratums[k].ordinal.test(lines[j])) {
                        stratum = k;
                        break;
                    }
                }
                
                switch(endDetect[1]) {
                case "。":
                    /// 處理所得稅法中，一個款／目中又分段的情形
                    if(stratum < 0) {
                        html += "<br />";
                        break;
                    }
                    /// 警告可能的錯誤情形
                    if(!depthArr.length             ///< 「項」
                        && lines[j-1].length == 32  ///< 前一行有32字
                        && !/\w/.test(lines[j-1])   ///< 且沒有英數
                        && lines[j]                 ///< 而這行不是最後一行
                    ) html += '<div class="LER-warning" title="此網頁是用「換行」的方式排版，因而【法規亦毒氣】沒能判斷這裡究竟是「換行」還是「分項」。">警告：這裡可能其實沒有分項</div>';
                    // no break!
                case "（刪除）":
                    html += "</li>";
                    while(depthArr.length && depthArr[depthArr.length - 1] != stratum) {
                        html += "</ol></li>";
                        depthArr.pop();
                    }   
                    break;
                case "：":
                    html += '<ol class="LER-art-' + stratums[stratum].name + '">';
                    depthArr.push(stratum);
                    break;
                default: 
                    console.log(endDetect);
                    throw new SyntaxError("RegExp returns wrong match.");
                }
                if(lines[j] && stratum >= 0) html += "<li>"; ///< 如果是末行的空白就不用加了
            }            
            html += lines[j].replace(/^\s+/, '');
        }
        var list = document.createElement("OL"); 
        list.innerHTML = html;
        list.className = (list.childElementCount == 1) ? "LER-art-singlePara" : "LER-art-paragraphs";
        pres[i].parentNode.replaceChild(list, pres[i]);
    }
    
})();