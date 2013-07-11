try {
    var lh = document.getElementById("LawHeader_hlHeader")  ///< 一般頁面
        || document.getElementById("LawHeader_hlHeaderP")   ///< 列印頁面
    ;
    LER.setDefaultLaw(lh.innerText);
}
catch(e) {}