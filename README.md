# Introduction
* a client-side JavaScript for popular browsers and an extension for Google Chrome to parse the contents of webpage to view Taiwan's law articles/websites easier.
* related with [g0v/laweasyread](https://github.com/g0v/laweasyread) but functions differently and not combined together yet.

一Google瀏覽器外掛，可於瀏覽網站時：
* 網頁中提到法規名稱或是條文時，將法規名稱與該條號變成連往[全國法規資料庫](http://law.moj.gov.tw/)的連結。
* 將下列網站稍做排版，使易於閱讀：
    * [大法官解釋](http://www.judicial.gov.tw/constitutionalcourt/p03.asp)
    * [立法院法律系統](http://lis.ly.gov.tw/lgcgi/lglaw)
    * [司法院裁判書查詢](http://jirs.judicial.gov.tw/FJUD/)
    
警告：部落客於編輯網誌時，請暫時關閉本外掛。

## Examples
![Legislative Yuan](http://images.plurk.com/kAGZ-6fkYtgu1BejEXshFvUGHcJ.jpg)
![Judicial Interpretation](http://images.plurk.com/kAGZ-5vXMDaSEAUQCW51VJ06k3Z.jpg)
![Laws & Regulations Database](http://images.plurk.com/kAGZ-1V1k4UwBowvUXGaOQ0DF6R.jpg)

# Installation
按網頁右側偏下方的 "Download ZIP" 下載本專案的打包檔，並解壓縮到任意處。

## Google Chrome Extension
* 進入Chrome的「擴充功能」設定頁面（網址輸入 chrome://extensions/ ），勾選右上角的「開發人員模式」。
* 點選剛剛冒出來的「載入未封裝擴充功能」按鈕。
* 選取剛剛解壓縮出來的資料夾。
* 網址列右邊出現「§#」圖示的話就是成功了，按該圖示會有一些連結。
* 解壓縮出來的資料夾與檔案不要刪掉。
* 試試在[全國法規資料庫](http://law.moj.gov.tw/)中搜尋一些法規，例如[個人資料保護法](http://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=I0050021)

警告：部落客於編輯網誌時，請暫時關閉本外掛。

## Embedded JavaScript for Websites and Blogs
暫停開發，目前亦僅有Google Chrome稍能運作。

在網頁HTML原始碼中的`</head>`前加入
```html
  <script src="pcodes.js"></script>
  <script src="aliases2.js"></script>
  <script src="embedded.js"></script>
```
路徑請自行修改。

（非必要）針對`.LER_lawName`和`.LER_artNum`編輯自己的CSS規則，或是引用本專案中的`embedded.css`
```html
  <link rel="stylesheet" type="text/css" href="embedded.css">
```

# Disclaimer
甚麼都不負責。

# License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)再加上一條：
被授權人於出版發行、散布、再授權及販售軟體及軟體的副本時，應於MIT授權條款上方或下方加上此規則，並：
* 陳述被授權人對於一個以上之公共議題之立場；或
* 附上與其立場類似之文章之永久連結。

此軟體此版本設定之公共議題為「性別」，立場為「性解放」，支持十歲以上智識者均得自主與人發生性行為與性交易，「性忠貞」並不是「道德」的一部份。參閱[反守貞地圖．哲學哲學雞蛋糕](http://phiphicake.blogspot.tw/2013/06/blog-post_4.html)

## License Explanation
* 於其軟體再版時，得變更議題與立場、連結。
* 軟體之使用與修改者，無須同意原軟體授權條款中基於本規則而對特定議題表態之立場。

# Notices
* 全國法規資料庫有收錄的均會加上連結－－除非原本已經是連結。
* 「網站內嵌JavaScript」部分暫停開發，有興趣者請參考 `embedded.*`。
* Google說「需支付一次性的開發人員註冊費 US$5.00」，所以（還）沒有放在「Chrome 線上應用程式商店」。
* 如為可編輯之純文字框，如 TEXTAREA ，即不會處理。

# Bugs
* 未確認與WYSIWYG編輯器的相互干擾情形。
* 會發生「漩渦鳴人的 §8 尾巴出現了」和「我國的 §3 國道走山事件」
* 未能運作於[零時政府立法院](http://ly.g0v.tw.jit.su/)、[評律網](http://www.pingluweb.com/)等以AJAX機制更新的內容。
* 未能順利處理以換行字元或BR標籤來排版的網頁（如[全國法規資料庫](http://law.moj.gov.tw/)及[司法院裁判書查詢](http://jirs.judicial.gov.tw/FJUD/)）。

# Development

## Javascript Prototype
只要引入 `jsExt.js` ，就可以一行
`document.body.replaceChildren(/第\s*(\d+)\s*條/, "§$1");`
就把所有的條號都轉換掉。

* 會把呼叫者的子節點（預設並含所有後代節點）中的 `ELEMENT_NODE` 中的 `TEXT_NODE` 都跑過
    * 雖然 `BUTTON`, `TEXTAREA`, `PRE` 和 `SCRIPT` 都是這幾個在本專案中應該都不需要處理，但為了維持該函數的通用性， `Text.prototype.replace` 和 `Element.prototype.replaceChildren` 並不主動排除該些節點。若有需要，未來可以考慮多加參數處理「要處理／排除的標籤」，並為該參數設定預設值。
* `Element.prototype.replaceChild` 亦被改寫。第一個引數不再必須是節點，亦可以是節點陣列。
* `jsExt.js` 亦改寫 `parseInt` ，可將中文數字字串轉為整數。

目前專案並無使用`jsExt.js`，不過若有上述需求者仍可參考。

## First Idea
原本是以字串取代的方式去改變document.body.innerHTML（之前的0.1.8版即是如此），但發現有三個難處：
* 有（類似）onLoad function的網頁（如「全國法規資料庫」的首頁）即會無後續動作。
* 不知道要怎麼樣避開HTML tag的屬性中的字串，特別是要提防屬性字串中又包含特殊字元的情形。
* 不知道怎麼偵測「是否已在<a />中」，困境同上。

## Current Scheme
用遞迴方式跑過整個HTML的DOM tree，抓出textNode來處理。
因此，勢必得用document.createElement和appendChild等DOM方法，而不能修改innerHTML。

## Algorithm
參閱`LER.js`，把每個「只含文字的節點」（`TEXT_NODE`)代換成一串新的節點。

* `parseElement()`嘗試處理`document.body`的每一個child。
    * 把非純文字的child再丟給`parseElement()`去recursion；
    * 把純文字的child代換為丟去`parseText()`而得的node array 
* `parseText()`
    * 用規則一的正規表示式把字串分段，把不匹配的部份再丟給規則二
    * 規則二的正規表示式不匹配的部份，再丟給規則三
    * 依此類推，直到沒有規則可再套用
    * 所有規則均跑完後，即回傳陣列，回到`parseElement()`把原本的文字節點替換成新的節點列。
* 將 `parseInt()` 改寫為支援中文數字，參閱`parseInt.js`
* 關於「多個條號」的處理，參閱`LER.js`中註解文字「條號比對－－支援多條文」以下

## Links to regulations
將[全國法規資料庫](http://law.moj.gov.tw/)中有收錄的（包含「已廢止法規」）均加上連結。其方法為：
* 將[g0v/laweasyread-data](https://github.com/g0v/laweasyread-data)的`data/pcode.json`改為本專案的`pcode.js`（就只是灌進一個變數中）
* 將名稱中只有中文、沒有標點符號的法規（約九千個）全部以'|'為連接符號，由長至短串成一個字串（共近20萬字），生成一個巨大的正規表示式。
