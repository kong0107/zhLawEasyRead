LER = function(){
    var rules = [];

    var skippingTags = ["SCRIPT", "CODE", "TEXTAREA"];
    /// Regular Expression Text
    var retNumber = "[\\d零一二三四五六七八九十百千]+";
    var retArticle = "第(%number%)條(之(%number%))?";
    var retElements = "not supported";

    var lawNames = [];
    for(var i = 0; i < pcodes.length; ++i) {
      var name = pcodes[i].name;
      if(name.length > 64) continue; /// 超過的其實原本就不會通過下一關，不過這邊或許可以省些時間？
      if(/[\w\s\(\)「」，、：　]/.test(name)) continue;
      lawNames.push(name);
    }
    lawNames.sort(function(a,b){return b.length-a.length}); /// 由長至短排列，以避免遇到「刑法施行法」卻比對到「刑法」

    var lawNameRE = new RegExp(lawNames.join("|"), 'g'); /// 共約十七萬字
    var numRE = new RegExp(retNumber, 'g');
    var retArticle = retArticle.replace(/%number%/g, retNumber);
    var artNumRE = new RegExp(retArticle, 'g');
    
    rules.push({
        pattern: lawNameRE,
        replace: function(match, index, input) {
            console.log(match);
            var i;
            for(i = 0; i < pcodes.length; ++i)
                if(match == pcodes[i].name) break;
            var node;
            if(!input.isDescendantOfTag('A')) {
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + pcodes[i].PCode);
            }
            else node = document.createElement("SPAN");
            node.setAttribute('title', match);
            node.className = "LER_lawName";
            node.appendChild(document.createTextNode(match));
            return node;
        }
    });
    
    rules.push({
        pattern: artNumRE,
        replace: function(match, num1, sub, num2, index, input) {
            if(input.isDescendantOfTag(skippingTags)) return [document.createTextNode(match)];
            var text = "§" + parseInt(num1);
            if(typeof num2 != "undefined") text += "-" + parseInt(num2);
            console.log(text);
            var node;
            if(!input.isDescendantOfTag('A')) {
                node = document.createElement('A');
                node.setAttribute('target', '_blank');
                //node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=" + pcode + "&FLNO=" + flno);
            }
            else node = document.createElement("SPAN");
            node.setAttribute('title', match);
            node.className = "LER_artNum";
            node.appendChild(document.createTextNode(text));
            return node;
        }
    });
    
    return {
        rules: rules,
        debug: function(varName) {return eval(varName);},
        parseAll: function() {
            for(var i = 0; i < rules.length; ++i) {
                document.body.replaceChildren(rules[i].pattern, rules[i].replace, skippingTags, true);
            }
            document.body.joinTexts();
        }
    };
}();
