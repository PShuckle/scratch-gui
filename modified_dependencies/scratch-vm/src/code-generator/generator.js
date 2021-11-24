const blockCodes = {
    event: require('./event'),
    motion: require('./motion'),
    operators: require('./operators')
};

class Generator {
    constructor (runtime) {
        this.runtime = runtime;
        this.activeBlocks = {};
        this.activeTarget = null;
    }

    stackToCode() {
        var target = this.runtime.targets[1];
        var blocks = target.blocks._blocks;
        var scripts = target.blocks.getScripts();
        this.activeBlocks = blocks;
        this.activeTarget = target;
        scripts.forEach(blockID => {
            console.log(this.blockToCode(blocks[blockID]));
        });
        
    }

    blockToCode(block) {
        for (const packageName in blockCodes) {
            packageObject = new (blockCodes[packageName])(this);
            var codeOrder = packageObject.getCode(block);
            if (codeOrder) {
                return codeOrder;
            }
        }
    }
}

module.exports = Generator;