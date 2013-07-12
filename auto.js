if(typeof LER == "object") (function(){
    if(LER.autoParse instanceof Element) {
        LER.parse(LER.autoParse);
        LER.debugTime("parsed all");

        /** 加上跳出的iframe，但只在頁面範圍夠大之時
          * 主要是不想讓iframe中又有iframe，但又要允許如司法院裁判書查詢系統那種有用frame的網站
          * 未確認評律網
          */
        if(window.innerHeight > 300 && window.innerWidth > 400) {
            LER.addIFrame(".LER-jyi");
            LER.addIFrame(".LER-artNum-container");
            LER.addIFrame(".LER-lawName-container", function(link) {
                return link.replace("All", "History");
            });
            LER.debugTime("add iframes");
        }
        else LER.debugTime("window size too small, no iframes set.");
    }

    /** 接收 popup 「轉換這個網頁」按鈕送出的訊息
      * `chrome.runtime.onMessage` 是Chrome 26版之後才有的
      * 舊版(20到25)應呼叫chrome.extension.onMessage
      */
    (chrome.runtime.onMessage
        ? chrome.runtime.onMessage
        : chrome.extension.onMessage
    ).addListener(
        function(request, sender, sendResponse) {
            if (request.greeting == "hello") {
                LER.parse(document.body);
            }
        }
    );

    /** 重新定位到hash
      * 因為重新排版是在DOM讀取完畢、加上anchor之後的事情，
      * 畫面位置可能已有變化，故需重新定位到hash
      */
    /*var hash = location.hash;
    if(hash) {
        location.hash = "";
        location.hash = hash;
    }*/
})();