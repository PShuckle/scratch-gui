const blockCodes = {
    // event: require('./code/event'),
    motion: require('./code/motion'),
    // operators: require('./code/operators'),
    // other: require('./code/other')
};

class Generator {
    constructor(runtime) {
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

        this.runtime.targets.forEach(target => {
            this.targetName = target.sprite.name;
            this.targetNameLookup[this.targetName] = target;
            this.activeBlocks = target.blocks._blocks;

            console.log(this.activeBlocks);

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
     * 
     * @param {!Element} xml 
     */
    domToJavascript(xml, targetName) {
        this.targetName = targetName;

        var code = '';

        var childCount = xml.childNodes.length;

        for (var i = 0; i < childCount; i++) {
            var xmlChild = xml.childNodes[i];
            console.log(xmlChild);
            var name = xmlChild.nodeName.toLowerCase();
            if (name == 'block') {
                code += this.blockToCode(xmlChild);
                code += ';\n\n';
            }
        }
        console.log(code);
        return code;
    }

    handleChildren(blockChildNodes) {
        var childrenBlockCode = {
            inputs: {},
            fields: {},
            next: ''
        };
        for (var i = 0; i < blockChildNodes.length; i++) {
            var childNode = blockChildNodes[i];
            var name = childNode.nodeName.toLowerCase();
            if (name == 'value') {
                var childBlock = childNode.childNodes[childNode.childNodes.length - 1];
                childrenBlockCode.inputs[childNode.getAttribute('name')] = this.blockToCode(childBlock);
            } else if (name == 'field') {
                childrenBlockCode.inputs[childNode.getAttribute('name')] = childNode.textContent;
            } else if (name == 'statement') {
                childrenBlockCode.inputs[childNode.getAttribute('name')] = '{' +
                    this.blockToCode(childBlock) + '}';
            } else if (name == 'next') {
                var nextBlock = childNode.childNodes[0];
                childrenBlockCode.next = '.next(\n' + this.blockToCode(nextBlock) + ')';
            }
        }

        return childrenBlockCode;

    }

    /**
     * converts a block to code
     * @param {*} block 
     * @returns code representing the block
     */
    blockToCode(block) {
        const childNodes = block.childNodes;

        const childrenBlockCode = this.handleChildren(childNodes);

        const inputs = childrenBlockCode.inputs;

        var code = block.getAttribute('type') + '(';

        Object.keys(inputs).forEach((input) => {
            code += inputs[input];
            code += ', ';
        });

        code += ')';

        code += childrenBlockCode.next;

        return code;
    }
}

module.exports = Generator;
