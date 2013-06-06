# encoding: UTF-8
# Error logs:
# 內政部組織法(01011)036061100 和其後的一個版本的第23條的「『秘』書」被植為「」（0xFECA），但應為0xAFA6
# 行政院衛生署組織法(01025)098051200 第14條第4項「（一）」被植為「」（0x93C6），其前的兩個版本則用不同字
# 國防法(01042)有099110501，亦即當天有兩次三讀!!?? 其後的就加上一個:version了
# 警察人員人事條例(01167)096061500 「銓『敘』部」被植為「」（0x97AB）
# 公職人員選舉罷免法(01177)100050600 第51條標題中的「『刊』登者」被植為「」（\x81c）
# 第一屆資深中央民意代表自願退職條例(01204) 第16條標題中的「『擔』保」被植為「」（\xFD]）
# 地籍清理條例(01266)096030200 第27條1項2款有個「『』耕權」（0xFEN），似乎是「『贌』耕權」（U+8D0C）
# 所得稅法(01513)066012100 第五十六條甲款的除號斜線…"\xA1\xFE"
# 01517, 01523, 01810, 01928, 02019 同上 "\xA1\xFE"
# 01582 "\xFD\xA8"
# 01721 (私立學校法) "\x96\xE1" except 20111209
# 01726 "\x95\xB4" (many exceptions)
# 01877 "\x93\xC6"
# 01918 "\xFBA"
# 01944, 02017 "\xFDD"
# 02301 "\xF9\xDA"
# 02406, 02504, 02509, 02515, 02531 "\xF9\xDB"
# 03101 "\xFDC"
# 03127 "\x8Ek"
# 03719 "\xFD\xD2"

# 9010661030700 is NOT 9010662032700 (check `:dates`)

Encoding.default_internal = Encoding::UTF_8
$lawstat = "D:/workdir/laweasyread-data/rawdata/lawstat/"
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

if !File.exists?($outputDir + "version2") then 
    FileUtils.mkdir($outputDir + "version2") 
end
if defined?($errLogger) && $errLogger.respond_to?(:closed?) && !errLogger.closed? then
    $errLogger.close
end
$errLogger = File.open($outputDir + "version2/error.log", "a")
$errLogger.write "####### " + Time.now.to_s + " #######\n"

d = Dir.new($lawstat + "version2/")
for $lyID in (d.each.sort) do
    if $lyID.to_i == 0 then next end
    #if $lyID.to_i < 90042 then next end
    puts $lyID
    $oDir = $outputDir + "version2/" + $lyID
    if !File.exists?($oDir) then FileUtils.mkdir($oDir) end
    dd = Dir.new($lawstat + "version2/" + $lyID)
    for $fileName in (dd.each.sort) do
        if $fileName.to_i == 0 then next end
        $oFileName = $oDir + "/" + $fileName.split(".")[0] + ".json"
        #if File.exists?($oFileName) then next end
        $html = IO.read(dd.path + "/" + $fileName)
        begin
            $utf8 = $html.encode("UTF-8", "BIG5")
        rescue Encoding::UndefinedConversionError
            $errLogger.write $!.error_char.dump + "\t" + $fileName + "\n"
            #$lyID + $!.error_char.dump + "\n\n"
        else
            $hash = parse_version2($utf8)
            IO.write($oFileName, $hash.to_json)
            #File.open($oFileName, "w") { |f| f.write($hash.to_json) }
        end
        #puts $fileName
    end
    dd.close
end
d.close
$errLogger.close
__LINE__
