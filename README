# 簡介
An extension for Chrome browser to view Taiwan's law articles/websites easier,
related with [g0v/laweasyread](https://github.com/g0v/laweasyread) but functions differently and not combined together yet.

Google瀏覽器外掛，可於瀏覽政府網站時：
* 自動將法規中的條項款目改為易於閱讀的文字代號，例如：
    * 「民法第一千零七十六條之一第一項第二款」將變為「民法§1076-1 I(2)」；
    * 「立法院公報第八十卷第二十二期第一０七頁」將變為「立法院公報vol. 80, no. 22, p.107」。
    * 條文中的「前條第一項第三款至第六款」則會變為「前條 I(3)至(6)」
* 將下列網站稍做排版，使易於閱讀：
    * [大法官解釋](http://www.judicial.gov.tw/constitutionalcourt/p03.asp)
    * [立法院法律系統](http://lis.ly.gov.tw/lgcgi/lglaw)
    * [司法院裁判書查詢](http://jirs.judicial.gov.tw/FJUD/)

## 範例截圖
![Example](http://images.plurk.com/c27a95275c55a8ccc4f8e39704df1875.jpg)


# 安裝
Google說「需支付一次性的開發人員註冊費 US$5.00」，所以（還）沒有放在「Chrome 線上應用程式商店」。
1. 按上方的ZIP下載本專案的打包檔，並解壓縮到某處。
2. 進入Chrome的[擴充功能](chrome://extensions/)設定，勾選右上角的「開發人員模式」。
3. 點選剛剛冒出來的「載入未封裝擴充功能」按鈕。
4. 選取剛剛解壓縮的目的地。
5. 網址列右邊出現「§#」的圖示話就是成功了，可以按看看。

# 外觀細節
* 為避免出現「漩渦鳴人的 §8 尾巴出現了」這種情況，僅限定 `*.gov.tw` 和 [法源法律網](http://www.lawbank.com.tw/‎)的網頁會轉換。
    *若需要針對其他網域，請編輯`manifest.json`內的最後一個`matches`，然後再於Chrome的[擴充功能](chrome://extensions/ )中「重新載入」。
* 將滑鼠移置被轉換後的文字，即會顯示原本的文字。但如為可編輯之純文字框，如 TEXTAREA ，即無此效果。
* 憲法與大法官釋字會加上連結－－除非原本已經是連結。
* 為方便複製至純文字編輯器如「記事本」，羅馬數字以英文字母組合而不以內碼表的符號顯示。「款」的圈圈數字亦同。
    *註：大陸地區與聯合國文件中，「項」與「款」的順序與台灣地區相反，但本外掛沒有考量此部分。

# 待解
* 未確認與Chrome 18版以後的支援度。
* 未能運作於[評律網](http://www.pingluweb.com/)等以AJAX機制更新的內容。
* 數個釋字或憲法條文並列時，僅有第一個會被轉換為連結。
* 以換行字元強制換行的排版網頁（如[全國法規資料庫](http://law.moj.gov.tw/)及[司法院裁判書查詢](http://jirs.judicial.gov.tw/FJUD/)）中，可能會將數行併成過長的一行。
* 一個法規（而非一個條文）若有分章節款目，其中「款」與「目」亦會被轉換。
* 以 BR 強制換行的字串尚不會被偵測到。

# 開發

## 最初構想
原本是以字串取代的方式去改變document.body.innerHTML（之前的0.1.8版即是如此），但發現有三個難處：
1. 有（類似）onLoad function的網頁（如「全國法規資料庫」的首頁）即會無後續動作。
2. 不知道要怎麼樣避開HTML tag的屬性中的字串（如各釋字專頁），特別是要提防屬性字串中又包含特殊字元的情形。
3. 不知道怎麼偵測「是否已在<a />中」，困境同上。

## 目前架構
用遞迴方式跑過整個HTML的DOM tree，抓出textNode來處理。
因此，勢必得用document.createElement和appendChild等DOM方法，而不能修改innerHTML。

核心演算法寫於 parseAndReplace.js 
### function `parser`(`node`, `inSpecial`)
`inSpecial`記載「是否為`TEXTAREA`、`A`或其他特殊元素或其後代」。
如果`node`是`ELEMENT_NODE`，那就把每個 childNode 也都丟進`parser()`遞迴；
如果`node`是`TEXT_NODE`，那就將該字串丟給`replacer`，並把原本的 node 用回傳的 nodeList （其實是陣列）取代。

對於 onLoad 後不會再變動的網頁，僅需`parser(document.body);`即可處理全部。

### function `replacer`(`textNode`, `inSpecial`)
輸入為文字節點；輸出為節點陣列。
1. 用第一個替換規則將字串分割。
    * 將符合的字串處理為格式化的node，並存至陣列`formattedMatches`
    * 將其他部分記於另一個陣列`pureTexts`
2. 對每一個`pureTexts`中的元素，以第二個替換規則重複步驟1，並將結果「插入」前述二陣列中。
3. 對每一個`pureTexts`中的元素，以第三個替換規則重複前述步驟。依此類推。
4. 當所有替換規則均已執行完畢，則將`pureTexts`與`formattedMatches`相互穿插後，回傳結果陣列。

#### 例子：
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


## 短期目標

如果網頁中出現[全國法規資料庫](http://law.moj.gov.tw/)有收錄的法規，即將法律名稱替換為直接連向[全國法規資料庫](http://law.moj.gov.tw/)的該法規專頁。
應會利用g0v/laweasyread-data的[data/pcode.json](https://github.com/g0v/laweasyread-data/blob/master/data/pcode.json)。