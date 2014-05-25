var SHORTCUTS = [
    // [shortcut,       command]
    ['ctrl+space',      'set-mark'],
    ['ctrl+k',          'kill-line'],
    ['ctrl+w',          'kill-region'],
    ['command+shift+,', 'beginning-of-buffer'],
    ['command+shift+.', 'end-of-buffer'],
];

function setUp() {
    setShortcuts(SHORTCUTS);
    Mousetrap.stopCallback = function(evt, element) {
        return element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA';
    };
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        invokeCommand(req.command, { text: req.text });
        sendResponse();
    });
}

function setShortcuts(shortcuts) {
    var shortcut, command;
    for (var i = 0, len = shortcuts.length; i < len; ++i) {
        shortcut = shortcuts[i][0];
        command  = shortcuts[i][1];
        Mousetrap.bind(shortcut, createShortcutHandler(command));
    }
}

function createShortcutHandler(command) {
    return function(evt) {
        if (invokeCommand(command)) {
            evt.preventDefault();
        }
    };
}

function invokeCommand(command, options) {
    var activeElem = document.activeElement;
    if (activeElem.tagName !== 'TEXTAREA' && activeElem.tagName !== 'INPUT') {
        return false;
    }

    console.log('invoke: ' + command);
    var buffer;
    if (activeElem.bufferId) {
        buffer = Buffer.getInstance(activeElem.bufferId);
    } else {
        buffer = new Buffer(activeElem);
        activeElem.bufferId = buffer.id;
    }

    switch (command) {
    case 'yank':
        buffer.yank(options.text);
        break;
    case 'kill-line':
        buffer.killLine();
        break;
    case 'kill-region':
        buffer.killRegion();
        break;
    case 'beginning-of-buffer':
        buffer.beginningOfBuffer();
        break;
    case 'end-of-buffer':
        buffer.endOfBuffer();
        break;
    case 'set-mark':
        buffer.setMark();
        break;
    }
    return true;
}

setUp();
