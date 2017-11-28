///////////////////////////////////////////////////////////////////////////
// Addon background script, it's a long running script which scan the    //
// bookmarks, learn the commands and then serve the requests coming from //
// the user                                                              //
///////////////////////////////////////////////////////////////////////////
console.log("Init background script");
var commandDb = {};

// Routine to create a search command in the local DB of commands
function makeSearchCommand(commandType) {
    console.log("makeSearchCommand %o", commandType);
    commandDb[commandType.name] = commandType;
}

// Special help command used to list all the available shortcuts
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

// Load all the commands by searching the bookmarks for those tagged with 'commandfox'
function loadFromBookMarks() {
    console.log("Reloading command from bookmarks");
    var gettingTagsSubTree = browser.bookmarks.getSubTree("tags________");
    console.log("Waiting for Tags Search");
    gettingTagsSubTree.then(
        function (tagsFolder) {
            //console.log("Tags Folder: %o", tagsFolder[0]);
            for (var tag of tagsFolder[0].children) {
                console.log(`Tag: ${tag}`);
                if (tag.title == "commandfox") {
                    for (var commandfox of tag.children) {
                        console.log("commandfox: %o", commandfox);
                        try {
                            var searching = browser.bookmarks.search({url: commandfox.url});
                            searching.then(
                                function (bookmarkItems) {
                                    if (bookmarkItems.length == 0) {
                                        console.log("Ambiguos result %o", bookmarkItems);
                                    } else {
                                        for (var bookmarkItem of bookmarkItems) {
                                            makeSearchCommand({name: bookmarkItem.title,
                                                               description: "Command " + bookmarkItem.title,
                                                               url:  bookmarkItem.url});
                                        }
                                    }
                                },
                                function (error) {
                                    console.log(`An error searching back by URL: ${error}`);
                                });
                        } catch (e) {
                            console.log(`Caught error ${e}, while resolving the title of the tag`);
                        }
                    }
                }
            }
        },
        function(error) {
            console.log(`Error: ${error} while trying to read Tags`);
        }
    );
}

// Re/Initialize commands
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

// Routine to handle a command coming from the content script invoked in the popup
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
            browser.tabs.create({"url": text});
        } else {
        }
    } else {
        var urlToOpen = urlData['url'];
        if (urlToOpen !== undefined) {
            var urlWithQuery = urlToOpen.replace("{QUERY}", queryCmd);
            urlWithQuery = urlWithQuery.replace("%7BQUERY%7D", queryCmd);
            browser.tabs.create({"url": urlWithQuery});
        }
        var funcToExec = urlData['func'];
        if (funcToExec) {
            funcToExec();
        }
    }
}

var portFromCS;

// Handle the incoming connection from the popup script and dispatch based on the properties present
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

// Load the commands when the background script initialize
loadCommands();
