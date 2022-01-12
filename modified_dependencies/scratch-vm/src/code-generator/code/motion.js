class Motion {

    constructor (generator) {
        this.generator = generator;
        this.targetName = this.generator.targetName;
    }

    getCode (block) {
        if (block) {
            switch (block.opcode) {
                case('motion_movesteps') : return this.motion(block, 'moveSteps');
                case('motion_gotoxy') : return this.motion(block, 'goToXy');
                case('motion_goto') : return this.motion(block, 'goTo');
                case('motion_goto_menu') : return this.motion_goToMenu(block);
                case('motion_turnright') : return this.motion(block, 'turnRight');
                case('motion_turnleft') : return this.motion(block, 'turnLeft');
                case('motion_pointindirection') : return this.motion(block, 'pointInDirection');
                case('motion_glidesecstoxy') : return this.motion(block, 'glideSecsToXy');
                case('motion_glideto') : return this.motion(block, 'glideTo');
                case('motion_glideto_menu') : return this.motion_glideToMenu(block);
                case('motion_ifonedgebounce') : return this.motion(block, 'ifOnEdgeBounce');
                case('motion_setrotationstyle') : return this.motion_setRotationStyle(block);
                case('motion_changexby') : return this.motion(block, 'changeXBy');
                case('motion_setx') : return this.motion(block, 'setX');
                case('motion_changeyby') : return this.motion(block, 'changeYBy');
                case('motion_sety') : return this.motion(block, 'setY');
                case('motion_xposition') : return this.motion_getXPosition(block);
                case('motion_yposition') : return this.motion_getYPosition(block);
                case('motion_direction') : return this.motion_getDirection(block);
            }
        }
        else {
            return '';
        }
    }

    motion (block, func) {
        const nextBlock = this.generator.activeBlocks[block.next];
        const inputs = block.inputs;

        var code = this.targetName + '.motion.' + func + '(';

        Object.keys(inputs).forEach((input) => {
            var inputBlock = this.generator.activeBlocks[inputs[input].block];
            code += this.generator.blockToCode(inputBlock);
            code += ', ';
        } );

        code += ');\n' + this.generator.blockToCode(nextBlock);
        return code;
    }

    motion_goToMenu (block) {
        var to = block.fields.TO.value;

        return to;
    }

    motion_glideToMenu (block) {
        var to = block.fields.TO.value;

        return to;
    }

    motion_setRotationStyle (block) {
        const nextBlock = this.generator.activeBlocks[block.next];

        var code = this.targetName + '.motion.setRotationStyle(' + block.fields.STYLE.value + ');\n'
        + this.generator.blockToCode(nextBlock);

        return code;
    }

    motion_getXPosition () {
        return this.targetName + '.motion.xPosition';
    }

    motion_getYPosition () {
        return this.targetName + '.motion.yPosition';
    }

    motion_getDirection () {
        return this.targetName + '.motion.direction';
    }
}

module.exports = Motion;