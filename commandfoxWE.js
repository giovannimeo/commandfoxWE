console.log("Launching commandfoxWE.js");

var inputArea = document.getElementById("edit-box");
inputArea.addEventListener('keyup', function onkeyup(event) {
    if (event.keyCode == 13) {
        // Remove the newline.
        var text = inputArea.value.replace(/(\r\n|\n|\r)/gm,"");
        console.log(`Send message to background script: ${text}`);
        var toBackgroundScript = browser.runtime.connect({name: "commandfoxWESendEditBox"});
        toBackgroundScript.postMessage({command: text});
        toBackgroundScript.onMessage.addListener(function(m) {
            console.log("Text Box processed by background script");
            console.log(m.result);
        });
        inputArea.value = '';
        window.close();
    }
}, false);

setTimeout(() => {
    inputArea.focus();
}, 100);

setTimeout(() => {
    inputArea.focus();
}, 200);
