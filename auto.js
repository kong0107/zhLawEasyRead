if(typeof LER == "object") (function(){
    if(LER.autoParse instanceof Element) LER.parse(LER.autoParse);

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