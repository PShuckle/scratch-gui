const blockCodes = {
    event: require('./code/event'),
    motion: require('./code/motion'),
    operators: require('./code/operators')
};

class Generator {
    constructor (runtime) {
        this.runtime = runtime;

        /**
         * store the name of the sprite as the key and the corresponding target as the object
         */
        this.targetNameLookup = {};

        /**
         * list of all blocks owned by the current target
         */
        this.activeBlocks = {};

        /**
         * name of the sprite representing the current target
         */
        this.targetName = '';
    }

    // generate compilable code for the whole workspace
    workspaceToCode() {
        var code = '';

        this.runtime.targets.forEach(target =>  {
            this.targetName = target.sprite.name;
            this.targetNameLookup[this.targetName] = target;
            this.activeBlocks = target.blocks._blocks;

            // get all blocks owned by this target that can start scripts
            var scripts = target.blocks.getScripts();

            scripts.forEach(blockID => {
                code += this.blockToCode(this.activeBlocks[blockID]);
            });   
        });
        // console.log(code);
        return code;
    }

    /**
     * converts a block to code
     * @param {*} block 
     * @returns code representing the block
     */
    blockToCode(block) {
        for (const packageName in blockCodes) {
            packageObject = new (blockCodes[packageName])(this);
            var code = packageObject.getCode(block);
            if (code) {
                return code;
            }
        }
    }
}

module.exports = Generator;