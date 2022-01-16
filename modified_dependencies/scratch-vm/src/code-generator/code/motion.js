class Motion {

    constructor(generator) {
        this.generator = generator;
        this.targetName = this.generator.targetName;
    }

    getCode(block) {
        if (block) {
            const opcode = block.getAttribute('type');
            // if (opcode.includes('motion')) {
            //     switch (opcode) {
            //         case ('motion_goto_menu'):
            //             return this.motion_goToMenu(block);
            //         case ('motion_glideto_menu'):
            //             return this.motion_glideToMenu(block);
            //         case ('motion_xposition'):
            //             return this.motion_getXPosition(block);
            //         case ('motion_yposition'):
            //             return this.motion_getYPosition(block);
            //         case ('motion_direction'):
            //             return this.motion_getDirection(block);
            //         default:
            //             return this.motion(block, opcode);
            //     }

            // }

            return this.motion(block, opcode);
        } else {
            return '';
        }
    }

    motion(block, opcode) {
        const childNodes = block.childNodes;

        const childrenBlockCode = this.generator.handleChildren(childNodes);

        const inputs = childrenBlockCode.inputs;

        var code = opcode + '(';

        Object.keys(inputs).forEach((input) => {
            code += inputs[input];
            code += ', ';
        });

        code += ')';

        code += childrenBlockCode.next;

        return code;
    }

    motion_goToMenu(block) {
        var to = block.fields.TO.value;

        return to;
    }

    motion_glideToMenu(block) {
        var to = block.fields.TO.value;

        return to;
    }

    motion_setRotationStyle(block) {
        const nextBlock = this.generator.activeBlocks[block.next];

        var code = this.targetName + '.motion.setRotationStyle(' + block.fields.STYLE.value + ');\n' +
            this.generator.blockToCode(nextBlock);

        return code;
    }

    motion_getXPosition() {
        return this.targetName + '.motion.xPosition';
    }

    motion_getYPosition() {
        return this.targetName + '.motion.yPosition';
    }

    motion_getDirection() {
        return this.targetName + '.motion.direction';
    }
}

module.exports = Motion;
