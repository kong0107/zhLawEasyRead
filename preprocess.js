if(location.href.indexOf("http://law.moj.gov.tw/LawClass/Law") == 0) {
    /** 如果連結到全國法規資料庫中不存在的法條，會強制執行
      * `alert('查無資料');history.go(-1);` // line #43
      * 由於該處是寫在<script />裡，因而不能等DOMContenetLoaded才處理
      * 但即使是在`document_start`時執行這個檔好像也沒幫助....
      * 先放著。
      */
    alert = function(str){ console.log(str); };
    history.go = function(){};
}