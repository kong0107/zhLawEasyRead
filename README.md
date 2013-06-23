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
![Embbed JS](http://images.plurk.com/kAGZ-6RFMjNeKA8ET4PRZDyhD3L.jpg)
![Legislative Yuan](http://images.plurk.com/kAGZ-11q1ZjeGxmdJImYNk2Ggvn.jpg)
![Laws & Regulations Database](http://images.plurk.com/kAGZ-2CW286GQdTnECQx0xKA6Dq.jpg)
![Judicial Interpretation](http://images.plurk.com/kAGZ-6oa3p19F5dAwNQLhbUR0u.jpg)

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
待修復，且目前亦僅有Google Chrome稍能運作。

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
* 「網站內嵌JavaScript」部分暫停開發，有興趣者請參考 `embedded.*`。
* Google說「需支付一次性的開發人員註冊費 US$5.00」，所以（還）沒有放在「Chrome 線上應用程式商店」。
* 將滑鼠移置被轉換後的文字，即會顯示原本的文字。但如為可編輯之純文字框，如 TEXTAREA ，即無此效果。
* 大法官釋字以及全國法規資料庫有收錄的均會加上連結－－除非原本已經是連結。
* 為方便複製至純文字編輯器如「記事本」，羅馬數字以英文字母組合而不以內碼表的符號顯示。「款」的圈圈數字亦同。
    * 註：大陸地區與聯合國文件中，「項」與「款」的順序與台灣地區相反，但本外掛沒有考量此部分。

# Bugs
* 未確認與WYSIWYG編輯器的相互干擾情形。如有使用類似編輯器的部落客請盡量以Widget的方式引用。
* 「漩渦鳴人的 §8 尾巴出現了」
* 即使修改會套用的網站，亦未能運作於[評律網](http://www.pingluweb.com/)等以AJAX機制更新的內容。
* 以換行字元強制換行的排版網頁（如[全國法規資料庫](http://law.moj.gov.tw/)及[司法院裁判書查詢](http://jirs.judicial.gov.tw/FJUD/)）中，可能會將數行併成過長的一行。
* 以 BR 強制換行的字串尚不會被偵測到。

# Development

## Javascript Prototype
目前只把核心開發好，還沒套用上去。
但未來只要引入 `jsExt.js` ，就可以一行
`document.body.replaceChildren(/第\s*(\d+)\s*條/, "§$1");`
就把所有的條號都轉換掉。

* 亦支援第二個引數為函數的情形，概念類同 `String.prototype.replace` ，詳參該檔中的註解。
* 會把呼叫者的子節點（預設並含所有後代節點）中的 `ELEMENT_NODE` 中的 `TEXT_NODE` 都跑過
    * 雖然 `BUTTON`, `TEXTAREA`, `PRE` 和 `SCRIPT` 都是這幾個在本專案中應該都不需要處理，但為了維持該函數的通用性， `Text.prototype.replace` 和 `Element.prototype.replaceChildren` 並不主動排除該些節點。若有需要，未來可以考慮多加參數處理「要處理／排除的標籤」，並為該參數設定預設值。
* `Element.prototype.replaceChild` 亦被改寫。第一個引數不再必須是節點，亦可以是節點陣列。
* `jsExt.js` 亦改寫 `parseInt` ，可將中文數字字串轉為整數。

## First Idea
原本是以字串取代的方式去改變document.body.innerHTML（之前的0.1.8版即是如此），但發現有三個難處：
* 有（類似）onLoad function的網頁（如「全國法規資料庫」的首頁）即會無後續動作。
* 不知道要怎麼樣避開HTML tag的屬性中的字串（如各釋字專頁），特別是要提防屬性字串中又包含特殊字元的情形。
* 不知道怎麼偵測「是否已在<a />中」，困境同上。

## Current Scheme
用遞迴方式跑過整個HTML的DOM tree，抓出textNode來處理。
因此，勢必得用document.createElement和appendChild等DOM方法，而不能修改innerHTML。

## Algorithm
說穿了就是：把每個「只含文字的節點」（`TEXT_NODE`)代換成一串新的節點。
核心演算法寫於 `embedded.js`
* `LER.parse()`嘗試處理`document.body`的每一個child。
    * 把非純文字的child再丟給`LER.parse()`去recursion；
    * 把純文字的child代換為丟去`parseArticleName()`而得的node array 
* `LER.parseLawName()`把字串分成「法規名稱」和「其他」兩區，然後再依原本的順序串成node array。
    * 處理法規名稱時，代換成連往全國法規資料庫中該法規的全部條文頁面的連結（如要連往其他網站，或是改成popup等，亦於此處理）
    * 處理「其他」時，丟給`parseArtNum()`嘗試尋找「第X條之Y」的子字串
* `LER.parseArtNum()`把字串分成「條號」和「其他」兩區，亦依原本的順序串成node array。
    * 可以處理「第七十七條之二十七」這種情形，並會轉換為如`§77-27`之格式。
    * 如果在前一階段有比對到法規名稱，此階段即會將條號加上連向該法規該條號的頁面。

## 以下為較舊的演算法，目前仍由瀏覽器外掛部分使用
見`parseAndReplace.js`
### function `parser`(`node`, `inSpecial`)
* `inSpecial`記載「是否為`TEXTAREA`、`A`或其他特殊元素或其後代」。
* 如果`node`是`ELEMENT_NODE`，那就把每個 childNode 也都丟進`parser()`遞迴；
* 如果`node`是`TEXT_NODE`，那就將該字串丟給`replacer`，並把原本的 node 用回傳的 nodeList （其實是陣列）取代。
* 對於 onLoad 後不會再變動的網頁，僅需`parser(document.body);`即可處理全部。

### function `replacer`(`textNode`, `inSpecial`)
輸入為文字節點；輸出為節點陣列。

#### Steps
* 用第一個替換規則將字串分割。
    * 將符合的字串處理為格式化的node，並存至陣列`formattedMatches`
    * 將其他部分記於另一個陣列`pureTexts`
* 對每一個`pureTexts`中的元素，以第二個替換規則重複步驟1，並將結果「插入」前述二陣列中。
* 對每一個`pureTexts`中的元素，以第三個替換規則重複前述步驟。依此類推。
* 當所有替換規則均已執行完畢，則將`pureTexts`與`formattedMatches`相互穿插後，回傳結果陣列。

#### Example
* Input: "社會秩序維護法第八十條第一項第一款…與憲法第七條之平等原則有違"
* Initialization:
    * `pureTexts = ["社會秩序維護法第八十條第一項第一款…與憲法第七條之平等原則有違"];`
    * `formattedMatches = [];`
* After rule 1:
    * `pureTexts = ["社會秩序維護法第八十條第一項第一款…與", "之平等原則有違"];`
    * `formattedMatches = [<a href="URL" title="憲法第七條">§7</a>];`
* After rule 2:
    * `pureTexts = ["社會秩序維護法", "", "", "…與", "之平等原則有違"];`
    * `formattedMatches = [
        <span title="第八十條">§80</span>, 
        <span title="第一項">I</span>, 
        <span title="第一款">(1)</span>, 
        <a href="URL" title="憲法第七條">§7</a>
    ];`


### Links to regulations
將[全國法規資料庫](http://law.moj.gov.tw/)中有收錄的（包含「已廢止法規」）均加上連結。其方法為：
* 將[g0v/laweasyread-data](https://github.com/g0v/laweasyread-data)的`data/pcode.json`改為本專案的`pcode.js`（就只是灌進一個變數中）
* 將名稱中只有中文、沒有標點符號的法規（約九千個）全部以'|'為連接符號，由長至短串成一個字串（15餘萬字），做為正規表示法的規則。
* 以前述規則比對，將比對到的字串回頭以`pcode.json`找出對應的pcode，即知連結。

## Short-term Target
* 讓條號（包含項款目）結合前述功能，轉換為指定條文的連結
* 讓前述連結能夠預覽
