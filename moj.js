/// 判斷「預設法規」
(function(){
    if(typeof LER != "object" || !LER.setDefaultLaw) return;
    var pages = ["All", "Single", "AllPara", "SearchNo", "SearchContent", "History"];
    var match = document.location.pathname.match(/^\/LawClass\/Law(\w+).aspx/);
    if(!match || pages.indexOf(match[1]) < 0) return;
    LER.setDefaultLaw(document.getElementById("Content").getElementsByTagName('A')[1].lastChild.data.replace(/\s/g, ''));
})();