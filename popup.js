document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded");
    document.getElementsByTagName("BUTTON")[0].onclick = function() {
        chrome.tabs.getSelected(null, function(tab) {
            console.log("button clicked on tab " + tab.id);
            chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
                console.log(response);
            });
        });
    };
});