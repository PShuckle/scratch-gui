const ORDER_PLACEHOLDER = 0;

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
            return ['', ORDER_PLACEHOLDER];
        }
    }

    event_whenkeypressed (block) {
        var nextBlock = this.generator.activeBlocks[block.next];
        var key = block.fields.KEY_OPTION.value;
        var code = 'document.addEventListener("keydown", function (event) {\nif (event.code === "' 
        + key + '") {'
        + this.generator.blockToCode(nextBlock)[0]
        + '}\n})';
        var order = ORDER_PLACEHOLDER;
        return [code, order];
    }
}

module.exports = Event;