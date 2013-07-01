/** 議事暨公報管理系統
  */
  
/** 處理「立法院議案關係文書」的HTML格式
  * 原始碼看來是從M$ Word轉過去的
  * 目前對會議記錄會跑非常久（可能超過一分鐘）
  */
if(document.location.href.indexOf("html") > 0) (function() {
    var ps = document.getElementsByTagName("P");
    /// 「立法院議案關係文書」那幾個字本身是用<span />調整大小的，就跳過不處理
    for(var i = 4; i < ps.length; ++i) ps[i].innerText = ps[i].innerText;
    if(typeof LER == "object" && LER.debugTime) LER.debugTime("delete ugly spans");
})();