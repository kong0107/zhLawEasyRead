/*
Bugs:
2. 所得稅法§14有「第某類」，§17有「1.」（第某目之一）和不知道該怎麼叫的「(1)」。
3. 有些「（刪除）」前面沒有空白，因而沒能偵測到。小心章節目款也會有「（刪除）」

Note: 這裡的「目」是用半行空白，但全國法規資料庫那邊的括號都是全形。
*/

depths = [
  {'name': 'article'},
  {'name': 'paragraph'},
  {'name': 'category', 'regex': /^第[一二三四五六七八九十]+類：/},
  {'name': 'subsection', 'regex': /^[一二三四五六七八九十]+、/},
  {'name': 'item', 'regex': /^\([一二三四五六七八九十]+\)/},
  {'name': 'depth5', 'regex': /^\d+\./},
  {'name': 'depth6', 'regex': /^\(\d+\)/}
];
function parseNodesWithLawTexts(nodes) {
  //var regex = /^\s*(　　[^<]+<br>\s*)+$/;
  var regex = /^\s*　　/;
  var i, j, node, working, paraList, lines, prevDepth, depth, cur;
  for(i = 0; i < nodes.length; i++) {
    regex.lastIndex = 0;
    if(regex.test(nodes[i].innerHTML)) {
      node = document.createElement('TD');
      working = paraList = document.createElement('OL');
      node.appendChild(paraList);
      lines = nodes[i].innerHTML.replace(/[　\n\r]/g, '').split('<br>');
      for(prevDepth = 1, j = 0; j < lines.length; j++, prevDepth = depth) {
        if(lines[j] == '') continue;
        if(lines[j].substr(0, 2) == '<a') {
          cur = document.createElement('A');
          cur.href = lines[j].match(/href=\"?([^\"\s]*)\"?\s/)[1];
          cur.target = '_blank';
          cur.appendChild(document.createTextNode(
            lines[j].substring(lines[j].indexOf('>')+1, lines[j].indexOf('<', 1))
          ));
          node.appendChild(cur);
          continue;
        }

        if(/^\(\d+\)/.test(lines[j])) depth = 5;
        else if(/^\d+\./.test(lines[j])) depth = 4;
        else if(/^\([一二三四五六七八九十]+\)/.test(lines[j])) depth = 3; // for items
        else if(/^[一二三四五六七八九十]+、/.test(lines[j])) depth = 2; // for subsections
        else if(/^第[一二三四五六七八九十]+類：/.test(lines[j])) depth = 1.5; // for 所得稅§14
        else depth = 1; // for paragraphs
        if(depth > prevDepth) {
          //if(!working.lastChild) working.appendChild(document.createElement('LI'));
          if(working.lastChild) {
            working.lastChild.appendChild(document.createElement('OL'));
            working = working.lastChild.lastChild;
          }
          working.classList.add((depth==2)?'subsecList':'itemList');
        }
        else if(depth < prevDepth)
          working = (depth == 1) ? paraList : working.parentNode.parentNode;
        cur = document.createElement('LI');
        cur.appendChild(document.createTextNode(lines[j].replace(/<[^>]*>/g, '')));
        working.appendChild(cur);
      }
      paraList.classList.add((paraList.childElementCount > 1) ? 'paraList' : 'singlepara');
      nodes[i].parentNode.replaceChild(node, nodes[i]);
    }
  }
}

parseNodesWithLawTexts(document.getElementsByTagName('TD'));