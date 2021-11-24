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

        // TODO: use actual keycodes
        var code = 'window.addEventListener(\'keydown\', (event) => {\nif (event.code === "' 
        + 'ArrowLeft' + '") {'
        + this.generator.blockToCode(nextBlock)
        + '}\n});\n';
        return code;
    }
}

module.exports = Event;