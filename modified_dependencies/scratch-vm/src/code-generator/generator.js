

const blockCodes = {
    operators: require('./operators')
};

class Generator {
    constructor (runtime) {
        this.runtime = runtime;
        this.activeBlocks = {};
    }

    stackToCode() {
        var target = this.runtime.targets[1];
        var blocks = target.blocks._blocks;
        this.activeBlocks = blocks;
        var keys = Object.keys(blocks);
        keys.forEach(key => {
            console.log(blocks[key]);
            console.log(this.blockToCode(blocks[key]));
        });
        
    }

    blockToCode(block) {
        packageObject = new (blockCodes['operators'])(this, this.runtime);
        var codeOrder = packageObject.getCode(block);
        return codeOrder;
    }
}

module.exports = Generator;