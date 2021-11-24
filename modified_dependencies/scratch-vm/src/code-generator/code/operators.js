class Operators {

    constructor (generator) {
        this.generator = generator;
    }

    getCode (block) {
        if (block) {
            switch (block.opcode) {
                case('math_number') :
                    return this.math_number(block);
                case('operator_add') : 
                    return this.operator_add(block);
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

    operator_add (block) {
        var num1_block = this.generator.activeBlocks[block.inputs.NUM1.block];
        var num2_block = this.generator.activeBlocks[block.inputs.NUM2.block];
        var code = this.generator.blockToCode(num1_block) + ' + ' 
        + this.generator.blockToCode(num2_block);
        return code;
    }
}

module.exports = Operators;