(function(){
    var images = document.getElementsByTagName('IMG');
    for(var i = 0; i < images.length; i++) {
        if(images[i].src == 'http://210.69.124.103/ASTAR/100E3722A0C00000040.GIF')
            images[i].parentNode.replaceChild(document.createTextNode('參'), images[i]);
    }

    /** 自動送出表單以看判決書
      */
    if(document.location.pathname == "/FJUD/FJUDQRY01_1.aspx" && document.location.search) {
        var form = document.getElementsByTagName("FORM")[0];
        var params = document.location.search.substr(1).split('&');
        for(var i = 0; i < params.length; ++i) {
            var pos = params[i].indexOf('=');
            if(pos <= 0) continue;
            var attr = params[i].substr(0, pos);
            var value = decodeURI(params[i].substr(pos + 1));
            if(!form[attr]) continue;
            switch(attr) {
            case "v_court":
                var options = form.v_court.getElementsByTagName("OPTION");
                for(var i = 0; i < options.length; ++i)
                    if(options[i].value.substr(0, 3) == value) {
                        options[i].selected = true;
                        break;  ///< 高等法院有兩個，第一個才對
                    }
                break;
            case "v_sys":
                for(var i = 0; i < form.v_sys.length; ++i)
                    if(form.v_sys[i].value == value) form.v_sys[i].checked = true;
                break;
            default:
                form[attr].value = value;
            }
        }
        form.submit();
        if(typeof LER == "object" && LER.setAutoParse) LER.setAutoParse(null);
    }
    
    /** 如果只有一個搜尋結果，那就直接看裁判書
      */
    if(document.location.pathname == "/FJUD/FJUDQRY02_1.aspx") {
        var as = document.getElementsByTagName("A");
        if(as.length == 3) { ///< 該頁有兩個其他連結
            document.location = as[0].href;
            if(typeof LER == "object" && LER.setAutoParse) LER.setAutoParse(null);
        }
    }
})();