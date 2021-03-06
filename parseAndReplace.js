/*
  Bugs:
    * 編章節款目
    * 行政訴訟法§96 III: 「第四十四條之『參加人』」會變成「§44-3加人」
  To-do list:
    * 判決書連結－－至少先做台上字/(最高法?院)?%NUMBER%年?台([上抗])字第%NUMBER%號(刑事|民事)?(裁定|判決|判例)?/
    * 預覽
    * 連續的釋字或條文: "迭經本院釋字第四三二號、第五二一號、第五九四號及第六０二號解釋闡釋在案"
    * 跳脫／不轉換的class（如className "noReduce"）
    * 自動斷行的處理
*/

RDict = {
    data: [],
    getRInfoByName: function (str) {
        if(typeof this.data[str.length] == "undefined") return null;
        for(var i in this.data[str.length]) {
            if(i == str) return this.data[str.length][i];
        }
        return null;
    },
    join: function(glue) {
        if(typeof glue == 'undefined') glue = '|';
        var strArr = new Array;
        for(var i = this.data.length - 1; i > 0; --i) {
            if(typeof this.data[i] == 'undefined') continue;
            for(name in this.data[i]) strArr.push(name);
        }        
        //alert(strArr.length);
        return strArr.join(glue);
    }
};

for(var i = 0; i < pcodes.length; ++i) {
    var pcode = pcodes[i].PCode;
    var name = pcodes[i].name;
    if(name.length > 64) continue; /// 超過得也不會通過下一關，不過這邊或許可以省些時間？
    if(/[\w\s\(\)（）「」，、：　]/.test(name)) continue;
    if(typeof RDict.data[name.length] == "undefined")
        RDict.data[name.length] = new Object;
    RDict.data[name.length][name] = new Object;
    RDict.data[name.length][name]['pcode'] = pcode;
}
delete pcodes;

for(var alias in aliases) {
    var fullName = aliases[alias];
    RDict.data[alias.length][alias] = RDict.data[fullName.length][fullName];
    RDict.data[fullName.length][fullName].alias = alias;
}
delete aliases;

replaceRules = new Array;


/// 把所有法規名稱串成一個規則，似乎會太長，且勢必需要regEx
replaceRules.push({
    splitter: RDict.join(), ///< seems to be too long....
    splitterNeedSpace: false,
    replacer: function(text) {
        var obj = RDict.getRInfoByName(text);
        return {
            origin: text,
            reduced: (typeof obj.alias == 'undefined') ? text : obj.alias,
            link: 'http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=' + obj.pcode
        };
    }
});

/// 把每個法規名稱都變成一個規則，可以不用regEx
/*for(var i = RDict.data.length - 1; i > 1; --i) {
    var obj = RDict.data[i];
    for(var j in obj) {
        //regStr = j.replace(/\./g, '\.');
        //regStr = j.replace(/\(/g, '\(').replace(/\)/g, '\)');
        replaceRules.push({
            splitter: j,
            splitterNeedSpace: false,
            minLength: j.length,
            replacer: function(text) {
                var obj = RDict.getRInfoByName(text);
                return {
                    origin: text,
                    reduced: (typeof obj.alias == "undefined") ? text : obj.alias,
                    link: 'http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=' + obj.pcode
                };
            }
        });
    }
}*/

/*replaceRules.push({
    /// 憲法 ///< 所有法律都套進去的話就不用這個了
    "splitter": "((我|中華民)國)?憲法第\\d+條",
    "splitterNeedSpace": true,
    "replacer": function(text) {
      var num = chNum2int(text);
      return {
        "origin": text,
        "reduced": "憲§" + num,
        "link": "http://law.moj.gov.tw/LawClass/LawSingle.aspx?Pcode=A0000001&FLNO=" + num
      };
    },
});*/
replaceRules.push({
    /// 大法官解釋
    "splitter": "(司法院|本院)?釋字?第?\\d+號(解釋(?!文))?",
    "splitterNeedSpace": true,
    "replacer": function(text) {
      var jyi = chNum2int(text);
      return {
        "origin": text,
        "reduced": "釋#" + jyi,
        "link": "http://www.judicial.gov.tw/constitutionalcourt/p03_01.asp?expno=" + jyi
      };
    }
});
replaceRules.push({
    /// 第幾號
    "splitter": "第\\d+號",
    "splitterNeedSpace": false,
    "replacer": function(text) {
      return {
        "origin": text,
        "reduced": "#" + chNum2int(text),
      };
    }
});
replaceRules.push({
    /// 條號
    "splitter": "(第\\d+(之\\d+)?[條項款目號卷期頁][　\\s]*(之\\d+)?)+",
    "replacer": function(text) {
      var match, num, result = '';
      var regex = "第\\d+(?:之\\d+)?([條項款目號卷期頁])(?:之\\d+)?";
      regex = regex.replace(/\\d\+/g, '([' + chNumber + ']+)');
      regex = new RegExp(regex, 'g');
      var parts = text.match(regex);
      for(var i = 0; i < parts.length; i++) {
        regex.lastIndex = 0;
        match = regex.exec(parts[i]);
        num = chNum2int(match[1]);
        switch(match[3]) {
          case '條':
            result += '§' + num;
            break;
          case '項':
            if(result.length) result += ' ';
            result += int2roman(num);
            break;
          case '款':
            /*if(num <= 20)
              result += unescape('%u' + (0x245f + num).toString(16));
            else*/ result += '(' + num + ')';
            break;
          case '目':
            result += int2roman(num, true);
            break;
          case '號':
            result += '#' + num;
            break;
          case '卷':
            result += 'vol. ' + num;
            break;
          case '期':
            if(result.length) result += ', ';
            result += 'no. ' + num;
            break;
          case '頁':
            if(result.length) result += ', ';
            result += 'p. ' + num;
            break;
        }
        num = match[2] || match[4];
        if(typeof num != 'undefined') result += '-' + chNum2int(num);
      }
      return {
        "origin": text,
        "reduced": result
      };
    }
});
replaceRules.push({
    /// 日期
    "splitter": "(((中華)?民國|西元)?\\d+年)?\\d+月\\d+日",
    "splitterNeedSpace": true,
    "replacer": function(text) {
      var regex = new RegExp('([' + chNumber + ']+)', 'g');
      var parts = text.match(regex);
      for(var i = 0; i < parts.length; i++)
        parts[i] = chNum2int(parts[i]);
      return {
        "origin": text,
        "reduced": parts.join('.'),
      };
    }
});
replaceRules.push({
    /// 年月
    "splitter": "((中華)?民國|西元)?\\d+年(\\d+月)?",
    "splitterNeedSpace": true,
    "replacer": function(text) {
      var regex = new RegExp('([' + chNumber + ']+)', 'g');
      var parts = text.match(regex);
      var result = chNum2int(parts[0]) + '年';
      if(parts.length > 1) result += chNum2int(parts[1]) + '月';
      return {
        "origin": text,
        "reduced": result
      };
    }
});
replaceRules.push({
    /// 時間
    "splitter": "(上午|下午|凌晨|傍晚|清晨)?[　\\s]*(\\d+[時分秒]){2,3}",
    "splitterNeedSpace": false,
    "replacer": function(text) {
      var regex = new RegExp('([' + chNumber + ']+)', 'g');
      var parts = text.match(regex);
      for(var i = 0; i < parts.length; i++)
        parts[i] = chNum2int(parts[i]);
      if(text.charAt(0) == '下') parts[0] = parts[0] % 12 + 12;
      return {
        "origin": text,
        "reduced": ' ' + parts.join(':'),
      };
    }
});
replaceRules.push({
    /// 法院名稱
    "splitter": "(臺灣|台灣|福建)?([^\s]{2}地方|高等)法院(檢察署)?",
    "splitterNeedSpace": true,
    "replacer": function(text) {
      var result, pos;
      if((pos = text.indexOf('地方')) >= 0) result = text.substr(pos - 2, 3);
      else if(text.charAt(0) != '福') result = '高';
      else result = '福建高';
      result += (text.indexOf('檢察署')>=0) ? '檢署' : '院';
      return {
        "origin": text,
        "reduced": result
      };
    }
});

for(i = 0; i < replaceRules.length; i++) {
  if(typeof replaceRules[i].minLength != 'undefined') continue;
  str = replaceRules[i].splitter;
  // Add space before each chinese word, BUT 在方括號裡就爆炸了啦 QQ
  if(replaceRules[i].splitterNeedSpace)
    str = str.replace(/([^\x00-\x7F])/g, '[　\\s]*$1');
  // Convert `\d+` to `chNumber`+, and add space, too.
  str = str.replace(/\\d\+/g, '[　\\s]*[' + chNumber + '][　\\s' + chNumber + ']*');
  // `String.split()` would list matched sub-expression, but I don't need it.
  str = str.replace(/\((?![?])/g, '(?:');
  replaceRules[i].splitter = new RegExp(str, 'g');
}


parser(document.body);

function parser(node, inSpecial) {
  var next;
  switch(node.nodeType) {
    case Node.ELEMENT_NODE:
      if(['A', 'TEXTAREA'].indexOf(node.nodeName) >= 0)
        inSpecial = node.nodeName;
      for(var cur = node.firstChild; cur; cur = next) {
        next = cur.nextSibling;
        /*
          There may be insertion between `cur` and `next` later;
          therefore this shouldn't be `cur = cur.nextSibling`.
        */
        parser(cur, inSpecial);
      }
      return;
    case Node.TEXT_NODE:
      var nl = replacer(node, inSpecial);
      node.parentNode.replaceChild(nl[0], node);
      node = nl[0];
      next = node.nextSibling;
      for(var i = 1; i < nl.length; i++)
        if(next) node.parentNode.insertBefore(nl[i], next);
        else node.parentNode.appendChild(nl[i]);
      return;
  }
}

function replacer(textNode, inSpecial) {
  // Input: textNode; Output: array of nodes
  var pureTexts = [textNode.data], formattedMatches = [];
  var i, j, k, splitted, matches;
  for(i = 0; i < replaceRules.length; i++) {
    var regex = replaceRules[i].splitter;
    var minLength = (typeof replaceRules[i].minLength == 'undefined') ? 3 : replaceRules[i].minLength;
    for(j = 0; j < pureTexts.length; j++) {
      if(pureTexts[j].replace(/[\x00-\x7F]/g, '').length < minLength) continue;
      splitted = pureTexts[j].split(replaceRules[i].splitter);
      if(splitted.length == 1) continue; // This means there's no match.
      matches = pureTexts[j].match(replaceRules[i].splitter);
      pureTexts = pureTexts.slice(0, j).concat(splitted, pureTexts.slice(j+1, pureTexts.length));
      for(k = 0; k < matches.length; k++)
        formattedMatches.splice(j + k, 0,
          replaceRules[i].replacer(matches[k].replace(/[　\s]/g, ''))
        );
      j += matches.length;
    }
  }

  if(pureTexts.length == 1) return [textNode]; // This means there's no match.
  var result = [], text, node, info;
  for(text = pureTexts.shift(); pureTexts.length; text = pureTexts.shift()) {
    if(text.length) result.push(document.createTextNode(text));
    info = formattedMatches.shift();
    if(typeof info == 'undefined') continue; ///< Why!? There wasn't any problem without this before version 0.2.7.

    if(inSpecial == 'TEXTAREA')
      node = document.createTextNode(info.reduced);
    else {
      if(inSpecial == 'A'  || !info.link)
        node = document.createElement('SPAN');
      else {
        node = document.createElement('A');
        node.setAttribute('href', info.link);
        node.setAttribute('target', '_blank');
      }
      node.setAttribute('title', info.origin);
      node.classList.add('lawArticle');
      node.appendChild(document.createTextNode(info.reduced));

    }
    result.push(node);
  }
  if(text.length) result.push(document.createTextNode(text));

  return result;
}