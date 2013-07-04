(function(){
    /** 在法規名稱處加上一個anchor
      * 以找「第一個TH標籤」實作，後續或許可以有其他應用。
      */
    var firstTH = document.getElementsByTagName("TH")[0];
    if(firstTH) 
        firstTH.innerHTML = '<a name="firstTH">' + firstTH.innerText + '</a>';

    if(typeof LER != "object" || !LER.setDefaultLaw) return;

    /// 判斷「預設法規」
    var pages = ["All", "Single", "AllPara", "SearchNo", "SearchContent", "History"];
    var match = document.location.pathname.match(/^\/LawClass\/Law(\w+).aspx/);
    if(!match || pages.indexOf(match[1]) < 0) return;
    LER.setDefaultLaw(document.getElementById("Content").getElementsByTagName('A')[1].lastChild.data.replace(/\s/g, ''));
})();