if(typeof LER == "object") (function(){
    if(LER.autoParse instanceof Element) {
        LER.parse(LER.autoParse);
        LER.debugTime("parsed all");
    }
    
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.greeting == "hello") {
                LER.parse(document.body);
            }
        }
    );
    
    /** 加上懸浮按鈕－－之前觸發不成功時用的
      * 加在沒有frame，或是最左下角的frame裡頭（不理iFrame）
      * 以下程式碼先判斷「『這個』是不是top左下角的那個frame」
      */    
    /*var target;
    if(top.document && top.document.domain == document.domain) {
        var fs;
        if(fs = top.document.getElementsByTagName("FRAMESET")[0]) {
            var rows = fs.rows ? fs.rows.split(",").length : 1;
            var cols = fs.cols ? fs.cols.split(",").length : 1;
            target = fs.getElementsByTagName("FRAME")[(rows-1)*cols].contentWindow;
        }
    }
    if(document.location.protocol != "file:"
        && (
            (window == top && !document.getElementsByTagName("FRAMESET").length)
            || window == target
        )
    ) {
        //console.log("fixed label");
        var fixed = document.createElement("DIV");
        var defaultText = "法令\n亦毒氣";
        fixed.appendChild(document.createTextNode(defaultText));
        fixed.setAttribute("title", "按下以再次分析／處理網頁內容\n（我知道這按鈕很像廣告，\n有請高手教我如何從 contextMenu 或 browserAction 存取網頁內容…）");
        fixed.onclick = function(){LER.parse(document.body); LER.debugTime("parse again");};
        fixed.onmouseover = function(){this.innerText = "按下\n以轉換";};
        fixed.onmouseout = function(){this.innerText = defaultText;};
        fixed.className = "LER-fixed";        
        document.body.appendChild(fixed);
    }*/
})();