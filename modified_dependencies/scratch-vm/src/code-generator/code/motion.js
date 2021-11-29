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
            return '';
        }
    }

    motion_movesteps (block) {
        var nextBlock = this.generator.activeBlocks[block.next];
        var stepsBlock = this.generator.activeBlocks[block.inputs.STEPS.block];
        var targetName = this.generator.targetName;
        var target = 'window.vm.generator.targetNameLookup.' + targetName;
        var steps = this.generator.blockToCode(stepsBlock);

        // TODO: Find way to call degToRad function from Math.Util
        var code = 'const steps = ' + steps + ';\n'
        + 'const radians = (Math.PI/180) * (90 - ' + target + '.direction);\n'
        + 'const dx = steps * Math.cos(radians);\n'
        + 'const dy = steps * Math.sin(radians);\n'
        + '' + target + '.setXY(' + target + '.x + dx, ' + target + '.y + dy);\n'
        + this.generator.blockToCode(nextBlock)
        + '\n';
        return code;
    }
}

module.exports = Motion;