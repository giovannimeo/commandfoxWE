// When the user hits return, send the "text-entered"
// message to main.js.
// The message payload is the contents of the edit box.
var inputArea = document.getElementById("edit-box");
inputArea.addEventListener('keyup', function onkeyup(event) {
    if (event.keyCode == 13) {
        // Remove the newline.
        text = inputArea.value.replace(/(\r\n|\n|\r)/gm,"");
        var toBackgroundScript = browser.runtime.connect({name: "commandfoxWESendEditBox"});
        toBackgroundScript.postMessage({command: text});
        toBackgroundScript.onMessage.addListener(function(m) {
            console.log("Text Box processed by background script");
            console.log(m.result);
        });
        inputArea.value = '';
    }
}, false);

// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
//
// Set the focus to the text area so the user can
// just start typing.
self.port.on("show", function onShow() {
  inputArea.focus();
});

