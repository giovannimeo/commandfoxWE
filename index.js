function onFulfilled(bookmarkItems) {
    for (item of bookmarkItems) {
        console.log(item.id);
    }
}

function onRejected(error) {
    console.log("An error: " + error);
}

browser.commands.onCommand.addListener(function(command) {
    if (command == "toggle-feature") {
        console.log("toggling the feature!");
    } else if (command == "search") {
        console.log("do search");
        
        var searching = browser.bookmarks.search({query: "commandfox"});
        
        searching.then(onFulfilled, onRejected);
    }

});

// var self = require('sdk/self');
// var tabs = require("sdk/tabs");
// var data = require("sdk/self").data;
// // Construct a panel, loading its content from the "text-entry.html"
// // file in the "data" directory, and loading the "get-text.js" script
// // into it.
// var text_entry = require("sdk/panel").Panel({
//     width: 850,
//     height: 80,
//     position: {
//         left: 0,
//         top: 0
//     },
//     contentURL: data.url("text-entry.html"),
//     contentScriptFile: data.url("get-text.js")
// });

// // Define keyboard shortcuts for showing and hiding a custom panel.
// var { Hotkey } = require("sdk/hotkeys");

// var commandDb = {}

// function makeSearchCommand(commandType) {
//     commandDb[commandType.name] = commandType
// }

// function helpCommand() {
//     tabs.open({url: "javascript:'<html><head><title>Command Fox - Existing Commands</title><meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\"/><meta http-equiv=\"Pragma\" content=\"no-cache\"/><meta http-equiv=\"Expires\" content=\"0\"/></head><body></body></html>'",
//                onLoad: function onLoad(tab) {
//                    var worker = tab.attach({
//                        contentScriptFile: data.url("get-help.js")
//                    });
//                    worker.port.emit("commandDb", commandDb);
//                }
//               });
// }

// function readTextFromFile(filename) {
//   var fileIO = require("sdk/io/file");
//   var text = null;
//   if (fileIO.exists(filename)) {
//     var TextReader = fileIO.open(filename, "r");
//     if (!TextReader.closed) {
//       text = TextReader.read();
//       TextReader.close();
//     }
//   }
//   return text;
// }

// function loadFromBookMarks() {
//     let { search, UNSORTED } = require("sdk/places/bookmarks");

//     // Multiple queries are OR'd together
//     search(
//         [ { tags: ["commandfox"] } ]
//     ).on("data", function (result) {
//         if (result !== undefined) {
//             jsonText = JSON.stringify(result);
//             makeSearchCommand({name: result.title,
//                                description: "Command " + result.title,
//                                url:  result.url});
//         }
//     });
// }

// function loadCommands() {
//     try {
//         // Cleanup the existing commands first
//         commandDb = {};

//         // Builtin command
//         makeSearchCommand({name: 'refresh',
//                            description: "Force reload of commands",
//                            func:  loadCommands});

//         makeSearchCommand({name: 'help',
//                            description: "Show table of help",
//                            func:  helpCommand});

//         loadFromBookMarks();
//     } catch (e) {
//         console.info(e);
//     }
// }

// // Actually load the commands
// loadCommands();

// var showHotKey = Hotkey({
//     combo: "control-space",
//     onPress: function() {
//         text_entry.show();
//     }
// });

// // When the panel is displayed it generated an event called
// // "show": we will listen for that event and when it happens,
// // send our own "show" event to the panel's script, so the
// // script can prepare the panel for display.
// text_entry.on("show", function() {
//     text_entry.port.emit("show");
// });

// // Listen for messages called "text-entered" coming from
// // the content script. The message payload is the text the user
// // entered.
// // In this implementation we'll just log the text to the console.
// text_entry.port.on("text-entered", function (text) {
//     commandName = text.split(" ", 1)[0];
//     queryCmd = text.slice(commandName.length + 1, text.length);
//     urlData = commandDb[commandName];
//     if (urlData === undefined) {
//         var candidates = [];
//         for (var commandKey in commandDb) {
//             if (commandKey.lastIndexOf(commandName, 0) === 0) {
//                 candidates.push(commandKey);
//             }
//         }
//         if (candidates.length === 1) {
//             console.log("Found unambigous closest candidate: " + candidates[0]);
//             urlData = commandDb[candidates[0]];
//         }
//     }
//     if (urlData === undefined) {
//         if (text.indexOf(':') !== -1) {
//             tabs.open(text);
//         } else {
//         }
//     } else {
//         urlToOpen = urlData['url'];
//         if (urlToOpen !== undefined) {
//             var urlWithQuery = urlToOpen.replace("{QUERY}", queryCmd);
//             urlWithQuery = urlWithQuery.replace("%7BQUERY%7D", queryCmd);
//             tabs.open(urlWithQuery);
//         }
//         funcToExec = urlData['func'];
//         if (funcToExec) {
//             funcToExec();
//         }
//     }
//     text_entry.hide();
// });
