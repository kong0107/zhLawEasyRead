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
    
    /** 處理把全國法規資料庫的斷行排版
      * 嘗試排版承接層式表單（如`ly.js`）
      * 處理中
      */
    /*var pres = document.getElementsByTagName("PRE");
    while(pres.length) {
        var list = document.createElement("OL");
        list.className = "LER-art-paragraphs";
        var lines = pres[0].innerText.split("\n");
        for(var i = 0; i < lines.length; ++i) {
            if(!lines[i].length) continue;
            list.innerHTML += "<li>" + lines[i] + "</li>";
        }
        pres[0].parentNode.replaceChild(list, pres[0]);
    }*/
})();