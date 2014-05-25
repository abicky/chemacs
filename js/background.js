var textarea = document.createElement('textarea');
document.body.appendChild(textarea);

chrome.commands.onCommand.addListener(function(command) {
    console.log('onCommand: ' + command);
    if (command === 'yank') {
        sendCommand({ command: command, text: getClipboardContent() });
    }
});

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    if (req.command === 'copy') {
        copyToClipboard(req.text);
        sendResponse();
    }
});

function sendCommand(args) {
    console.log('sendCommand: ' + JSON.stringify(args));
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, args, function(response) {
            console.log(response);
        });
    });
}

function getClipboardContent() {
    textarea.select();
    // Add one space, otherwise the last empty line will be ignored
    textarea.value = ' ';
    document.execCommand('paste');
    // Remove the space added on the first phase
    return textarea.value.slice(0, -1);
}

function copyToClipboard(text) {
    textarea.value = text;
    textarea.select();
    return document.execCommand('copy');
}
