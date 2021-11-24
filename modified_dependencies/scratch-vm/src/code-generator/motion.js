const ORDER_PLACEHOLDER = 0;

class Motion {

    constructor (generator) {
        this.generator = generator;
    }

    getCode (block) {
        if (block) {
            switch (block.opcode) {
                case('motion_movesteps') :
                    return this.motion_movesteps(block);
            }
        }
        else {
            return ['', ORDER_PLACEHOLDER];
        }
    }

    motion_movesteps (block) {
        console.log(this.generator.activeTarget);
        var nextBlock = this.generator.activeBlocks[block.next];
        var stepsBlock = this.generator.activeBlocks[block.inputs.STEPS.block];
        var targetName = this.generator.activeTarget.sprite.name;
        var steps = this.generator.blockToCode(stepsBlock)[0];
        console.log(steps);
        var code = 'const steps = ' + steps + ';\n'
        + 'const radians = MathUtil.degToRad(90 - ' + targetName + '.direction);\n'
        + 'const dx = steps * Math.cos(radians);\n'
        + 'const dy = steps * Math.sin(radians);\n'
        + targetName + '.setXY(' + targetName + '.x + dx, ' + targetName + '.y + dy);\n'
        + this.generator.blockToCode(nextBlock);
        return [code, ORDER_PLACEHOLDER];
    }
}

module.exports = Motion;