const { ORDER } = require("../io/video");

const ORDER_PLACEHOLDER = 0;

class Operators {

    constructor (generator, runtime) {
        this.generator = generator;
    }

    getCode (block) {
        switch (block.opcode) {
            case('math_number') :
                return this.math_number(block);
            case('operator_add') : 
                return this.operator_add(block);
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
        var code = this.getCode(num1_block)[0] + ' + ' + this.getCode(num2_block)[0];
        var order = ORDER_PLACEHOLDER;
        return [code, order];
    }
}

module.exports = Operators;