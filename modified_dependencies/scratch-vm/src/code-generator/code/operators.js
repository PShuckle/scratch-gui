class Operators {

    constructor (generator) {
        this.generator = generator;
    }

    getCode (block) {
        if (block) {
            switch (block.opcode) {
                case('operator_add') : return this.operator_arithmetic(block, '+');
                case('operator_subtract') :return this.operator_arithmetic(block, '-');
                case('operator_multiply') : return this.operator_arithmetic(block, '*');
                case('operator_divide') :return this.operator_arithmetic(block, '/'); 
                case('operator_lt') : return this.operator_logical(block, '<');
                case('operator_equals') : return this.operator_logical(block, '==');
                case('operator_gt') : return this.operator_logical(block, '>');
                case('operator_and') : return this.operator_logical(block, '&&');
                case('operator_or') : return this.operator_logical(block, '||');
                case('operator_not') : return this.operator_not(block);
                case('operator_random') : return this.operator_random(block);
                case('operator_join') : return this.operator_strings(block, 'join');
                case('operator_letter_of') : return this.operator_letter_of(block);
                case('operator_length') : return this.operator_length(block);
                case('operator_contains') : return this.operator_strings(block, 'contains');
                case('operator_mod') : return this.operator_arithmetic(block, '%');
                case('operator_round') : return this.operator_round(block);
                case('operator_mathop') : return this.operator_mathop(block);
            }
        }
        else {
            return '';
        }
    }

    operator_arithmetic (block, operator) {
        var input1_block = this.generator.activeBlocks[block.inputs.NUM1.block];
        var input2_block = this.generator.activeBlocks[block.inputs.NUM2.block];
        var code = '(' + this.generator.blockToCode(input1_block) + ' ' + operator + ' '
        + this.generator.blockToCode(input2_block) + ')';
        return code;
    }

    operator_logical (block, operator) {
        var input1_block = this.generator.activeBlocks[block.inputs.OPERAND1.block];
        var input2_block = this.generator.activeBlocks[block.inputs.OPERAND2.block];
        var code = '(' + this.generator.blockToCode(input1_block) + ' ' + operator + ' '
        + this.generator.blockToCode(input2_block) + ')';
        return code;
    }

    operator_not (block) {
        var input_block = this.generator.activeBlocks[block.inputs.OPERAND.block];
        var code = '!(' + this.generator.blockToCode(input_block) + ')';
        return code;
    }

    operator_random (block) {
        var input1_block = this.generator.activeBlocks[block.inputs.FROM.block];
        var input2_block = this.generator.activeBlocks[block.inputs.TO.block];
        var code = 'getRandomBetween(' + this.generator.blockToCode(input1_block) + ', ' 
        + this.generator.blockToCode(input2_block) + ')';
        return code;
    }

    operator_strings (block, func) {
        var input1_block = this.generator.activeBlocks[block.inputs.STRING1.block];
        var input2_block = this.generator.activeBlocks[block.inputs.STRING2.block];
        var code = func + '(' + this.generator.blockToCode(input1_block) + ', ' 
        + this.generator.blockToCode(input2_block) + ')';
        return code;
    }

    operator_letter_of (block) {
        var input1_block = this.generator.activeBlocks[block.inputs.LETTER.block];
        var input2_block = this.generator.activeBlocks[block.inputs.STRING.block];
        var code = 'letterOf(' + this.generator.blockToCode(input1_block) + ', ' 
        + this.generator.blockToCode(input2_block) + ')';
        return code;
    }

    operator_length (block) {
        var input_block = this.generator.activeBlocks[block.inputs.STRING.block];
        var code = 'length(' + this.generator.blockToCode(input_block) + ')';
        return code;
    }

    operator_round (block) {
        var input_block = this.generator.activeBlocks[block.inputs.NUM.block];
        var code = 'Math.round(' + this.generator.blockToCode(input_block) + ')';
        return code;
    }

    operator_mathop (block) {
        const operator = block.fields.OPERATOR.value;
        var input_block = this.generator.activeBlocks[block.inputs.NUM.block];

        switch(operator) {
            case 'e ^': return 'ePower(' + this.generator.blockToCode(input_block) + ')';
            case '10 ^': return 'tenPower(' + this.generator.blockToCode(input_block) + ')';
            default: return operator + '(' + this.generator.blockToCode(input_block) + ')';
        }
    }
}
module.exports = Operators;