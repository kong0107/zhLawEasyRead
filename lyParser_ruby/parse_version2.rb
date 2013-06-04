# encoding: UTF-8

# Error logs:
# 內政部組織法(01011)036061100 和其後的一個版本的第23條的「『秘』書」被植為「」（0xFECA），但應為0xAFA6
# 行政院衛生署組織法(01025)098051200 第14條第4項「（一）」被植為「」（0x93C6），其前的兩個版本則用不同字
# 國防法(01042)有099110501，亦即當天有兩次三讀!!?? 其後的就加上一個:version了
# 警察人員人事條例(01167)096061500 「銓『敘』部」被植為「」（0x97AB）
# 公職人員選舉罷免法(01177)100050600 第51條標題中的「『刊』登者」被植為「」（\x81c）
# 第一屆資深中央民意代表自願退職條例(01204) 第16條標題中的「『擔』保」被植為「」（\xFD]）


if !defined?($outputDir) then
    require "JSON"
    require "fileutils"
    eval IO.read("init.rb")
    $outputDir = "D:/workdir/zhLawEasyRead/lyParser_ruby/json/"
end

d = Dir.new($lawstat + "version2/")
for $lyID in (d.each) do
    if $lyID.to_i == 0 then next end
    #if $lyID.to_i < 1266 then next end
    puts $lyID
    $oDir = $outputDir + "version2/" + $lyID
    if !File.exists?($oDir) then FileUtils.mkdir($oDir) end
    dd = Dir.new($lawstat + "version2/" + $lyID)
    for fileName in (dd.each) do
        if fileName.to_i == 0 then next end
        $oFileName = $oDir + "/" + fileName.split(".")[0] + ".json"
        if File.exists?($oFileName) then next end
        $html = IO.read(dd.path + "/" + fileName)
        $utf8 = $html.encode("UTF-8", "BIG5")
        $hash = parse_version2($utf8)
        IO.write($oFileName, $hash.to_json)
        #puts fileName
    end
    dd.close
end
d.close
__LINE__