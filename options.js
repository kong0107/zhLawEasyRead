// 用JS建立物件
document.addEventListener('DOMContentLoaded', function() {
    var formats = [
        "第一百零七條之十八第六項第五款第四目之三",
        "§107-18 VI(5)iv-3"
    ];
    var form = document.getElementsByTagName('FORM')[0];
    for(var i = 0; i < formats.length; ++i) {
        var container = document.createElement("DIV");
        container.innerHTML = '<label><input type="radio" name="artNumFormat" value="' + formats[i] + '" />'+ formats[i] +'</label>';
        form.appendChild(container);
    }
});

// Saves options to localStorage.
document.querySelector('#save').addEventListener('click', function() {    
    var radios = document.getElementsByName("artNumFormat");
    for(var i = 0; i < radios.length; ++i) {
        if(radios[i].checked) {
            localStorage["artNumFormat"] = radios[i].value;
            break;
        }
    }
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "儲存成功";
    setTimeout(function() {status.innerHTML = "";}, 750);
});

// Restores select box state to saved value from localStorage.
document.addEventListener('DOMContentLoaded', function() {
    var radios = document.getElementsByName("artNumFormat");
    for(var i = 0; i < radios.length; ++i) {
        if(radios[i].value == localStorage["artNumFormat"]) {
            radios[i].checked = true;
            break;
        }
    }
});