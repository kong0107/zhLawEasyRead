# encoding: UTF-8
eval IO.read("lyParser.rb")
$html = IO.read($lawstat + "version2/04102/0410261031700.html").encode("UTF-8", "BIG5")
$a = parse_version2($html)
$articles = $a[:articles]
$first = $articles[0]
$content = $first[:content]
$articles.length