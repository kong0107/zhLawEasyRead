if(typeof LER == "object") {
    if(document.location.pathname == "/LawClass/LawAll.aspx") {
        var pcode = document.location.href.substr(document.location.href.indexOf('=')+1);
        for(var i = 0; i < pcodes.length; ++i) {
            if(pcodes[i].PCode == pcode) {
                LER.setDefaultLaw(pcodes[i].name);  // 好像有點本末倒置，不過先這樣吧
            }
        }
        
    }
}