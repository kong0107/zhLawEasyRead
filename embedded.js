LER = {
  inited: false,
  lawNames: [],
  lawNameRE: null,
  numRE: null,
  artNumRE: null,
  lastPCode: "",
  onload: function(){}, /// used while overwrite window.onload

  /// Regular Expression Text
  retNumber: "[\\d零一二三四五六七八九十百千]+",
  retElement: "第(?:%number%)條(?:之(?:%number%))?",
  retElements: "not supported",

  init: function(){
    for(var i = 0; i < pcodes.length; ++i) {
      var name = pcodes[i].name;
      if(name.length > 64) continue; /// 超過的其實原本就不會通過下一關，不過這邊或許可以省些時間？
      if(/[\w\s\(\)（）「」，、：　]/.test(name)) continue;
      this.lawNames.push(name);
    }
    this.lawNames.sort(function(a,b){return b.length-a.length}); /// 由長至短排列，以避免遇到「刑法施行法」卻比對到「刑法」

    this.lawNameRE = new RegExp(this.lawNames.join("|"), 'g'); /// 共約十七萬字
    this.numRE = new RegExp(this.retNumber, 'g');
    this.retElement = this.retElement.replace(new RegExp("%number%", 'g'), this.retNumber);
    this.artNumRE = new RegExp(this.retElement, 'g');

    if(window.onload) this.onload = window.onload;
    window.onload = function() {
      LER.onload();
      LER.parse(document.body);
    };

    this.inited = true;
  },

  getPCodeByName: function(name) {
    /// 未來修改方向：init()已經把lawNames改成由長至短排列，故這邊應該能有更快的搜尋方式－－但不知有無必要
    for(var i = 0; i < pcodes.length; ++i) {
      if(name == pcodes[i].name) return pcodes[i].PCode;
    }
    return null;
  },

  parseLawName: function(str, inSpecial) {
    var result = [], node;
    this.lawNameRE.lastIndex = 0;
    var splitted = str.split(this.lawNameRE);
    var matched = str.match(this.lawNameRE);
    for(var i = 0; i < splitted.length; ++i) {
      if(splitted[i].replace(/\s+/, '').length > 0) {
        if(this.lastPCode.length)
          result = result.concat(this.parseArtNum(splitted[i]));
        else result.push(document.createTextNode(splitted[i]));
      }
      /// handle matched law names
      if(splitted.length == 1 || i == matched.length) break;

      this.lastPCode = this.getPCodeByName(matched[i]);
      //if(inSpecial != 'TEXTAREA') {
      if(!inSpecial) {
        node = document.createElement('A');
        node.setAttribute('target', '_blank');
        node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=" + this.lastPCode);
      }
      else node = document.createElement("SPAN");
      node.className = "LER_lawName";
      node.appendChild(document.createTextNode(matched[i]));
      //}
      //else node = document.createTextNode(matched[i]);
      result.push(node);
    }
    return result;
  },

  parseArtNum: function(str, inSpecial) {
    var result = [], node;
    this.artNumRE.lastIndex = 0;
    var splitted = str.split(this.artNumRE);
    var matched = str.match(this.artNumRE);
    for(var i = 0; i < splitted.length; ++i) {
      if(splitted[i].replace(/\s+/, '').length > 0)
        result.push(document.createTextNode(splitted[i]));
      if(splitted.length == 1 || i == matched.length) break;

      var nums = matched[i].match(this.numRE);
      var flno = this.chineseToInt(nums[0]);
      if(typeof nums[1] != 'undefined') flno += "-" + this.chineseToInt(nums[1]);
      if(!inSpecial) {
        node = document.createElement('A');
        node.setAttribute('target', '_blank');
        node.setAttribute('href', "http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=" + this.lastPCode + "&FLNO=" + flno);
      }
      else node = document.createElement('SPAN');
      node.setAttribute('title', matched[i]);
      node.className = "LER_artNum";
      node.appendChild(document.createTextNode("§"+flno));
      result.push(node);
    }
    return result;
  },

  chineseToInt: function(str) {
    var ones = '零一二三四五六七八九０１２３４５６７８９○ㄧ';
    var tens = '十百千拾佰仟什';
    var i, pos, result = '';
    str = str.replace(new RegExp('[^' + ones + tens + ']', 'g'), '');
    if(!isNaN(parseInt(str))) return parseInt(str, 10);
    if(!new RegExp('[' + tens + ']', 'g').test(str)) {
      for(i = 0; i < str.length; i++)
        result += ones.indexOf(str.charAt(i)) % 10;
    }
    else {
      str = str.replace(/^[十什拾]/, '一十');
      str = str.replace(new RegExp('(^|[^' + ones + '])[十什拾]', 'g'), '$1一十');
      for(i = 0; i < str.length; i++) {
        pos = ones.indexOf(str.charAt(i)) % 10;
        if(pos > 0) {result += '+' + pos; continue;} // zero could be ignored
        pos = tens.indexOf(str.charAt(i)) % 3;
        if(pos >= 0) result += '*' + [10, 100, 1000][pos];
      }
    }
    return eval(result);
  },

  parse: function(node, inSpecial) {
    var next;
    if(typeof inSpecial == 'undefined') inSpecial = '';
    switch(node.nodeType) {
      case Node.ELEMENT_NODE:
        if(node.nodeName == 'TEXTAREA') return;
        if(node.nodeName == 'A' && node.href) inSpecial = 'A';
        for(var cur = node.firstChild; cur; cur = next) {
          next = cur.nextSibling;
          /*
            There may be insertion between `cur` and `next` later;
            therefore this shouldn't be `cur = cur.nextSibling`.
          */
          this.parse(cur, inSpecial);
        }
        return;
      case Node.TEXT_NODE:
        var nl = this.parseLawName(node.data, inSpecial);
        if(!nl.length) return;
        node.parentNode.replaceChild(nl[0], node);
        node = nl[0];
        next = node.nextSibling;
        for(var i = 1; i < nl.length; i++)
          if(next) node.parentNode.insertBefore(nl[i], next);
          else node.parentNode.appendChild(nl[i]);
        return;
    }
  },

  dummy: null
};
LER.init();
