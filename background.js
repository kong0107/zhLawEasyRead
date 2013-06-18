/*chrome.contextMenus.create({
    "title": "右鍵選單測試", 
    "contexts": ["selection"],
    "onclick": function(info, tab) {
        alert(info.selectionText);        
        console.log("item " + info.menuItemId + " was clicked");
        console.log("info: " + JSON.stringify(info));
        console.log("tab: " + JSON.stringify(tab));
        a = info;
        b = tab;
        chrome.tabs.executeScript(tab.id, {code:"document.body.appendChild(document.createTextNode('cccc'));"});
        chrome.tabs.executeScript(null, {code:"document.body.bgColor='red'"});
    }
});*/
//console.log('background');