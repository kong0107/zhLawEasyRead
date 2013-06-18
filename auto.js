//LER.parseAll();
window.onload = function() {
    var orig = window.onload ? window.onload : function(){};
    return function() {
        var result = orig.apply(this, arguments);
        LER.parseAll();
        return result;
    };    
}();
//console.log('content_script');