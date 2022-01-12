class Other {

    constructor (generator) {
        this.generator = generator;
    }

    getCode (block) {
        if (block) {
            switch (block.opcode) {
                case('math_number') : return this.math_number(block);
                case('math_whole_number') : return this.math_number(block);
                case('text') : return this.text(block);
            }
        }
        else {
            return '';
        }
    }

    math_number(block) {
        var code = block.fields.NUM.value;
        return code;
    }

    text(block) {
        var code = block.fields.TEXT.value;
        return code;
    }
}

module.exports = Other;