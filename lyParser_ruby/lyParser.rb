# encoding: UTF-8
def parse_version2(html)
    lyID = html.match(/<title>法編號:(\d{5})/)[1]
    html.match(/版本:(\d{7})(\d{2})<\/title>/)
    puts date = ($1.to_i + 19110000).to_s
    version = $2.to_i
    #puts date = (html.match(/版本:(\d{7})00<\/title>/)[1].to_i + 19110000).to_s
    puts name = html.match(/<FONT COLOR=blue SIZE=5>(.*)\(\d{5}\)/)[1]
    
    dates = []
    html.gsub(/<tr><td align=left valign=top>\n?(<a [^>]+>)?<nobr><font size=2>中華民國 (\d+) 年 (\d+) 月 (\d+) 日([^<]*)<\/font><\/nobr>((<\/a>)?\n<\/td>\n<td valign=top><font size=2>([^<>]+(<br>\n[^<>]+)*)<\/font>)?<\/td>/) do
        dates.push({:date=>("%d-%02d-%02d"%[$2.to_i+1911,$3,$4]), :verb=>$5, :desc=>$8})
    end
    
    divisions = []
    html.gsub(/<table><tr><td>&nbsp;&nbsp;&nbsp;<\/td>\n<td><font color=4000ff size=4>(第([一二三四五六七八九十]+)([編章節款目])(之[一二三四五六七八九十]+)?)  ([^<]+)<\/font>/) do
        num = $2.to_i * 100 + $4.to_i
        divisions.push({:offset=>$~.begin(0), :type=>$3, :num=>num, :title=>$5})
    end

    articles = []
    html.gsub(/<table><tr><td>&nbsp;&nbsp;&nbsp;<\/td><td>(<font color=8000ff>(第([零一二三四五六七八九十百千]+)條(之[一二三四五六七八九十]+)?)<\/font>)?\n(&nbsp;&nbsp;<font size=2>\(([^\)]*)\))?<\/font>\n<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;<\/td>\n<td>\n(([^<]+<br>\n)+)<\/td>/) do
        num2 = $4.to_s
        num = $3.to_i * 100 + num2.slice(1, num2.to_s.length-1).to_i
        content = $7.gsub /(^|<br>(\n))(　*)/, '\2'
        articles.push({:offset=>$~.begin(0), :num=>num, :title=>$6, :content=>content})
    end
    
    return {
        :lyID => lyID,
        :date => date,
        :version => version,
        :name => name,
        :dates => dates,
        :divisions => divisions,
        :articles => articles
    }
end