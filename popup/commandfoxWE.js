console.log("Launching commandfoxWE.js");
setTimeout(() => {
    document.getElementById("edit-box").focus();
    console.log("timeout1");
}, 100);

setTimeout(() => {
    document.getElementById("edit-box").focus();
    console.log("timeout2");
}, 200);
