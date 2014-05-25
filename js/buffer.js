var Buffer = (function() {
    function Buffer(elem) {
        this.id = ++Buffer._currentId;
        this._elem = elem;
        Buffer._buffers[this.id] = this;
    }
    Buffer._currentId = 0;
    Buffer._buffers = {};
    Buffer.getInstance = function(id) {
        return Buffer._buffers[id];
    };
    // public methods (related with Emacs interactive functions)
    Buffer.prototype.setMark    = setMark;
    Buffer.prototype.yank       = yank;
    Buffer.prototype.killLine   = killLine;
    Buffer.prototype.killRegion = killRegion;
    Buffer.prototype.gotoChar   = gotoChar;
    Buffer.prototype.beginningOfBuffer = beginningOfBuffer;
    Buffer.prototype.endOfBuffer       = endOfBuffer;
    // private methods (related with Emacs functions)
    Buffer.prototype._point    = _point;
    Buffer.prototype._pointMax = _pointMax;
    // private helper methods
    Buffer.prototype._setMarkAt       = _setMarkAt;
    Buffer.prototype._killRegion      = _killRegion;
    Buffer.prototype._copyToClipboard = _copyToClipboard;


    function setMark() {
        this._setMarkAt(this._point());
    }

    function yank(text) {
        var content = this._elem.value;
        var currentPos = this._point();
        this._elem.value  = content.substring(0, currentPos);
        this._elem.value += text
        this._elem.value += content.substring(currentPos);
        this.gotoChar(currentPos + text.length);
        this._setMarkAt(currentPos);
    }

    function killLine() {
        var startPos = this._point();
        var endPos = startPos + this._elem.value.substring(startPos).indexOf('\n');
        if (startPos === endPos) {
            // an empty line
            ++endPos;
        } else if (startPos > endPos) {
            // no newline after the current position
            endPos = this._pointMax();
        }
        this._killRegion(startPos, endPos);
    }

    function killRegion() {
        var currentPos = this._point();
        var startPos, endPos;
        if (currentPos > this._mark) {
            startPos = this._mark;
            endPos   = currentPos;
        } else {
            startPos = currentPos;
            endPos   = this._mark;
        }

        this._killRegion(startPos, endPos);
    }

    function gotoChar(pos) {
        this._elem.setSelectionRange(pos, pos);
    }

    function beginningOfBuffer() {
        this._setMarkAt(this._point());
        this.gotoChar(0);
    }

    function endOfBuffer() {
        this._setMarkAt(this._point());
        this.gotoChar(this._pointMax());
    }

    function _point() {
        // Caution: this value is not correct if some text is selected
        return this._elem.selectionStart;
    }

    function _pointMax() {
        return this._elem.value.length;
    }

    function _setMarkAt(pos) {
        this._mark = pos;
    }

    function _killRegion(startPos, endPos) {
        var text = this._elem.value.substring(startPos, endPos);

        this._copyToClipboard(text, function(res) {
            var content = this._elem.value;
            this._elem.value  = content.substring(0, startPos);
            this._elem.value += content.substring(endPos);
            this.gotoChar(startPos);
            this._setMarkAt(startPos);
        }.bind(this));
    }

    function _copyToClipboard(text, callback) {
        chrome.runtime.sendMessage({ command: 'copy', text: text }, function(res) {
            callback(res);
        });
    }

    return Buffer;
})();
