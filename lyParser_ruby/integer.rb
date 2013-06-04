# encoding: UTF-8
class Integer
    def to_roman(upper = true)
        if self <= 0 || self >= 4000 then return self.to_s end
        result = 'M' * (self / 1000)
        result += ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'][self % 1000 / 100]
        result += ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'][self % 100 / 10]
        result += ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][self % 10]
        upper ? result : result.downcase
    end
    def to_chinese(baseWan = 0)
        digits = "零一二三四五六七八九" # well, maybe use "〇"
        if baseWan < 0 then 
            return self.to_s.tr("-0123456789", "負" + digits) 
        end
        if (abs = self.abs) > 10000 then
            result = (abs / 10000).to_chinese(baseWan + 1)
            abs %= 10000
        else result = ""
        end
        if (thousand = abs / 1000 % 10) > 0 then 
            result += digits[thousand] + "千" 
        end
        if (hundred = abs / 100 % 10) > 0 then 
            if result != "" && thousand == 0 then result += "零" end
            result += digits[hundred] + "百" 
        end
        if (ten = abs / 10 % 10) > 0 then
            if result != "" && hundred == 0 then result += "零" end
            if ten > 1 || result != "" && hundred == 0 then
                # to disable weird law-numeric mode, just delete hundred==0 condition
                result += digits[ten]
            end
            result += "十"
        end
        if (one = abs % 10) > 0 then
            if result != "" && ten == 0 then result += "零" end
            result += digits[one]
        end
        if self < 0 then result = "負" + result end
        if baseWan > 0 then result += "萬億兆京垓秭穰溝澗正載極"[baseWan-1] end
        # ref: http://zh.wikipedia.org/wiki/%E4%B8%AD%E6%96%87%E6%95%B8%E5%AD%97
        return result
    end
end
