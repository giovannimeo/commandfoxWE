console.log("Init background script");
var commandDb = {};

function makeSearchCommand(commandType) {
    commandDb[commandType.name] = commandType;
}

function helpCommand() {
    var creatingHelpTab = browser.tabs.create({"url": "/commandfoxWEHelpTab.html"});
    creatingHelpTab.then(
        function (tab) {
            console.log(`Created Help Tab: ${tab.id}`);
            console.log("Sending a message to help tab");
            var commandInfo = {};
            for (var cmd of Object.keys(commandDb)) {
                commandInfo[cmd] = {name: cmd,
                                    description: commandDb[cmd].description};
            }
            browser.tabs.sendMessage(
                tab.id,
                {commands: commandInfo}
            ).then(response => {
                console.log("Help Tab completed rendering: " + response);
            }).catch(function (error) { console.error(`Error: ${error}`); });
            console.log("Sent message to help tab");
        },
        function (error) {
            console.log(`Error creating Help Tab: ${error}`);
        }
    );
}

function loadFromBookMarks() {
    console.log("Reloading command from bookmarks");
    var gettingTagsSubTree = browser.bookmarks.getSubTree("tags________");
    console.log("Waiting for Tags Search");
    gettingTagsSubTree.then(
        function (tagsFolder) {
            console.log(`Tags Folder: ${tagsFolder[0]}`);
            for (var tag of tagsFolder[0].children) {
                console.log(`Tag: ${tag}`);
                if (tag.title == "commandfox") {
                    for (var commandfox of tag.children) {
                        console.log(`commandfox: ${commandfox.title} url: ${commandfox.url}`);
                        makeSearchCommand({name: commandfox.title,
                                           description: "Command " + commandfox.title,
                                           url:  commandfox.url});
                    }
                }
            }
        }, 
        function(error) {
            console.log(`Error: ${error} while trying to read Tags`);
        }
    );
}

function loadCommands() {
    try {
        // Cleanup the existing commands first
        commandDb = {};

        // Builtin command
        makeSearchCommand({name: 'refresh',
                           description: "Force reload of commands",
                           func:  loadCommands});

        // Builtin command
        makeSearchCommand({name: 'help',
                           description: "Show table of help",
                           func:  helpCommand});

        loadFromBookMarks();
        // Everytime the bookmarks are changed, make sure to reload the commands
        browser.bookmarks.onChanged.addListener(loadFromBookMarks);
        browser.bookmarks.onCreated.addListener(loadFromBookMarks);
    } catch (e) {
        console.info(e);
    }
}

// Routine to handle a command coming from the content script
function handleCommand(text) {
    console.log(`Handle command: ${text}`);
    var commandName = text.split(" ", 1)[0];
    var queryCmd = text.slice(commandName.length + 1, text.length);
    var urlData = commandDb[commandName];
    if (urlData === undefined) {
        var candidates = [];
        for (var commandKey in commandDb) {
            if (commandKey.lastIndexOf(commandName, 0) === 0) {
                candidates.push(commandKey);
            }
        }
        if (candidates.length === 1) {
            console.log("Found unambigous closest candidate: " + candidates[0]);
            urlData = commandDb[candidates[0]];
        }
    }
    if (urlData === undefined) {
        if (text.indexOf(':') !== -1) {
            tabs.create({"url": text});
        } else {
        }
    } else {
        var urlToOpen = urlData['url'];
        if (urlToOpen !== undefined) {
            var urlWithQuery = urlToOpen.replace("{QUERY}", queryCmd);
            urlWithQuery = urlWithQuery.replace("%7BQUERY%7D", queryCmd);
            tabs.create({"url": urlWithQuery});
        }
        var funcToExec = urlData['func'];
        if (funcToExec) {
            funcToExec();
        }
    }
}

var portFromCS;

function connected(p) {
    console.log("Connected from content script");
    portFromCS = p;
    portFromCS.onMessage.addListener(function(m) {
        console.log(`Received a message ${m}`);
        if (m.hasOwnProperty("command")) {
            console.log(`Received a command: ${m.command}`);
            handleCommand(m.command);
        }
    });
}

browser.runtime.onConnect.addListener(connected);

// Actually load the commands
loadCommands();

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
