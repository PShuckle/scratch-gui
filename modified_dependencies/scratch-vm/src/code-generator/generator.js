Element.prototype.next = function (nextBlock) {
    const next = document.createElement('next');
    this.appendChild(next);
    next.appendChild(nextBlock);
    return this;
}

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

    /**
     * 
     * @param {!Element} xml 
     */
    domToExecutableJavascript(xml, targetName) {
        this.targetName = targetName;

        var code = '';

        var childCount = xml.childNodes.length;

        for (var i = 0; i < childCount; i++) {
            var xmlChild = xml.childNodes[i];
            console.log(xmlChild);
            var name = xmlChild.nodeName.toLowerCase();
            if (name == 'block') {
                code += this.blockToExecutableCode(xmlChild);
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
                // childrenBlockCode.inputs[childNode.getAttribute('name')] = {};
                // childNode.childNodes.forEach(childBlock => {
                //     if (childBlock.nodeName.toLowerCase() == 'shadow') {
                //         childrenBlockCode.inputs[childNode.getAttribute('name')].shadow =
                //             this.blockToCode(childBlock);
                //     } else {
                //         childrenBlockCode.inputs[childNode.getAttribute('name')].block =
                //             this.blockToCode(childBlock);
                //     }
                // })
                var childBlock = childNode.childNodes[childNode.childNodes.length - 1];
                childrenBlockCode.inputs[childNode.getAttribute('name')] = this.blockToExecutableCode(childBlock);
            } else if (name == 'field') {
                childrenBlockCode.inputs[childNode.getAttribute('name')] = childNode.textContent;
            } else if (name == 'statement') {
                childrenBlockCode.inputs[childNode.getAttribute('name')] = '{' +
                    this.blockToExecutableCode(childBlock) + '}';
            } else if (name == 'next') {
                var nextBlock = childNode.childNodes[0];
                childrenBlockCode.next = '.next(\n' + this.blockToExecutableCode(nextBlock) + ')';
            }
        }

        return childrenBlockCode;

    }

    /**
     * converts a block to code
     * @param {*} block 
     * @returns code representing the block
     */
    blockToExecutableCode(block) {
        const childNodes = block.childNodes;

        const childrenBlockCode = this.handleChildren(childNodes);

        const inputs = childrenBlockCode.inputs;

        var code = 'this.' + block.getAttribute('type') + '(';

        Object.keys(inputs).forEach((input) => {
            code += inputs[input];
            code += ', ';
        });

        code += ')';

        code += childrenBlockCode.next;

        return code;
    }

    createBlock(type, inputs, shadow) {
        var block;

        if (shadow) {
            block = document.createElement('shadow');
        }
        else {
            block = document.createElement('block');
        }
        
        block.setAttribute('type', type);

        const values = inputs.values;
        const fields = inputs.fields;

        if (values) {
            Object.keys(values).forEach((valueName) => {
                const value = document.createElement('value');
                block.appendChild(value);
                value.setAttribute('name', valueName);
                value.appendChild(values[valueName]);
            });
        }
        
        if (fields) {
            Object.keys(fields).forEach((fieldName) => {
                const field = document.createElement('field');
                block.appendChild(field);
                field.setAttribute('name', fieldName);
                field.textContent = fields[fieldName];
            });
        }

        

        return block;
    }

    math_number(num) {
        return this.createBlock('math_number', {
            fields: {
                NUM: num
            }
        }, true);
    }

    motion_movesteps(steps) {
        return this.createBlock('motion_movesteps', {
            values: {
                STEPS: steps
            }
        });
    }

    javascriptToXml(javascript) {
        const topBlock = eval(javascript);
        const xml = document.createElement('xml');
        xml.appendChild(topBlock);
        return xml;
    }
}

module.exports = Generator;
