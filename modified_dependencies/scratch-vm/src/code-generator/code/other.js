class Other {

    constructor (generator) {
        this.generator = generator;
    }

    getCode (block) {
        if (block) {
            const opcode = block.getAttribute('type');
            switch (opcode) {
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
        const childBlockCode = this.generator.handleChildren(block.childNodes);
        const code = childBlockCode.inputs.NUM;
        return code;
    }

    text(block) {
        const field = block.childNodes[0];
        var code = field.textContent;
        return code;
    }
}

module.exports = Other;