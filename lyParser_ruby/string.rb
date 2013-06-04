# encoding: UTF-8
class String
	alias_method :orig_to_i, :to_i
    def to_i(base=10)
        # Chinese number is supported for positive integers below 100,000.
        if (result = self.orig_to_i(base)) != 0 then return result end
        cpy = self.gsub /\s/, ""
        if cpy == "0" then return 0 end
        if cpy =~ /[十百千萬]/ then
            ones = "〇一二三四五六七八九零壹貳參肆伍陸柒捌玖０ㄧ"
            tens = "十百千拾佰仟"
            wans = "萬億兆京垓秭穰溝澗正載極"

            cpy.tr! "零〇０○", ""
            cpy.gsub! Regexp.new("^([" + tens + wans + "])"), '一\1'
            cpy.gsub! Regexp.new("([" + tens + wans + "])([" + tens + "])"), '\1一\2'
            cpy.gsub! Regexp.new("([^" + wans + "]+)([" + wans + "])") do
                "+(" + $1 + ")*10000**" + (wans.index($2)+1).to_s
            end
            cpy.gsub! Regexp.new("[" + tens + "]") do
                |m| "*10**" + (tens.index(m)%3+1).to_s
            end
            cpy.gsub! Regexp.new("[" + ones + "]") do
                |m| "+" + (ones.index(m)%10).to_s
            end
            # puts cpy # for debug
            eval cpy
        else
            cpy.tr("〇一二三四五六七八九零壹貳參肆伍陸柒捌玖０○ㄧ", "01234567890123456789001").orig_to_i 10
            # 不能用eval，否則"0"開頭的會被轉成八進位。
        end
    end
end
