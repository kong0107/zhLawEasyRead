# encoding: UTF-8
#Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8
$lawstat = "D:/HTTrack/ly_lawstat_v2/lis.ly.gov.tw/lghtml/lawstat/"
eval IO.read("integer.rb")#.encode("utf-8", "utf-8")
eval IO.read("string.rb")#.encode("utf-8", "utf-8")
eval IO.read("lyParser.rb")#.encode("utf-8", "utf-8")
$html = IO.read($lawstat + "version2/01092/01092100061400.html").encode("UTF-8", "BIG5")
__LINE__