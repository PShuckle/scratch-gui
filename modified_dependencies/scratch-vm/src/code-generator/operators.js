const ORDER_PLACEHOLDER = 0;

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
            return ['', ORDER_PLACEHOLDER];
        }
    }

    math_number(block) {
        var code = block.fields.NUM.value;
        var order = ORDER_PLACEHOLDER;
        return [code, order];
    }

    operator_add (block) {
        var num1_block = this.generator.activeBlocks[block.inputs.NUM1.block];
        var num2_block = this.generator.activeBlocks[block.inputs.NUM2.block];
        var code = this.generator.blockToCode(num1_block)[0] + ' + ' 
        + this.generator.blockToCode(num2_block)[0];
        var order = ORDER_PLACEHOLDER;
        return [code, order];
    }
}

module.exports = Operators;