# encoding: UTF-8
Encoding.default_internal = Encoding::UTF_8
$lawstat = "D:/HTTrack/ly_lawstat_v2/lis.ly.gov.tw/lghtml/lawstat/"
#$lawstat = "/home/rd1/kong0107/lawstat/"
$outputDir = "D:/workdir/zhLawEasyRead/lyParser_ruby/json/"
#$outputDir = "/home/rd1/kong0107/zhLawEasyRead/json/"
if !defined?(debug) then
    require "json"
    require "fileutils"
    eval IO.read("string.rb")
    eval IO.read("integer.rb")
    eval IO.read("lyParser.rb")
    def debug(start, length)
        $utf8 = $html.slice(start, length).encode("UTF-8", "Big5")
    end
end
