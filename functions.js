chDigit = '零壹貳參肆伍陸柒捌玖〇一二三四五六七八九０１２３４５６７８９○ㄧ';
chTenth = '十百千拾佰仟什';
chNumber = '\\d' + chDigit + chTenth;

function chNum2int(str) {
  var i, result, pos;
  str = str.replace(new RegExp('[^' + chNumber + ']', 'g'), '');
  // 有時會是零開頭喔!!
  if(!isNaN(parseInt(str))) return str;
  if(!new RegExp('[' + chTenth + ']', 'g').test(str)) {
    result = '';
    for(i = 0; i < str.length; i++)
      result += chDigit.indexOf(str.charAt(i)) % 10;
    return result;
  }

  result = '0';
  str = str.replace(/^[十什拾]/, '一十');
  str = str.replace(new RegExp('([^' + chDigit + '])[十什拾]', 'g'), '$1一十');
  for(i = 0; i < str.length; i++) {
    pos = chDigit.indexOf(str.charAt(i)) % 10;
    if(pos > 0) {result += '+' + pos; continue;} // zero could be ignored
    pos = chTenth.indexOf(str.charAt(i)) % 3;
    if(pos >= 0)
      result += '*' + [10, 100, 1000][pos];
  }
  return eval(result);
}

function int2roman(num, lower) {
  /*
    Note that:
    1. There may be more than one way to represent the same integer.
       See also Wikipedia, 'Roman numerals.'
    2. This function allows only positive integer less than 4000.
    3. This function works just as CSS' "list-style-type: upper-roman"
  */
  lower = Boolean(lower);
  var result = '';
  var r = [
    //['', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ'],
    ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
    ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'],
    ['', 'M', 'MM', 'MMM']
  ];
  num = parseInt(num);
  if(isNaN(num) || num <= 0 || num >= 4000) return num;
  if(num <= 12) return unescape('%u' + (0x215f + (lower*16) + num).toString(16));
  for(var i = 3; i >= 0; i--)
    result += r[i][parseInt(num % Math.pow(10, i+1) / Math.pow(10, i))];
  if(typeof lower != 'undefined' && lower) result = result.toLowerCase();
  return result;
}