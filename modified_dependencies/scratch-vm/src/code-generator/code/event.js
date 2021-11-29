const keyToEventCode = require('../key-to-event-code');

class Event {

    constructor (generator) {
        this.generator = generator;
    }

    getCode (block) {
        if (block) {
            switch (block.opcode) {
                case('event_whenkeypressed') : 
                    return this.event_whenkeypressed(block);
            }
        }
        else {
            return '';
        }
    }

    event_whenkeypressed (block) {
        var nextBlock = this.generator.activeBlocks[block.next];
        var key = block.fields.KEY_OPTION.value;

        var code = 'var onKeyEvent = function(event) {';
            if (key != 'any') {
                var eventCode = keyToEventCode[key];
                code += 'if (event.code === "' + eventCode + '") {\n'
                + this.generator.blockToCode(nextBlock) + '}\n};\n';
            }
            else {
                code += this.generator.blockToCode(nextBlock) + '\n};\n';
            }

        code += 'document.addEventListener(\'keydown\', onKeyEvent);\n';

        return code;
    }
}

module.exports = Event;