import VariableNameGenerator from "./variable-name-generator";

export default class xmlToJavascript {

    constructor() {
        this.varNameGenerator = new VariableNameGenerator();

        this.code = '';
        this.variables = {};
        this.parameters = {};
        this.functions = {};
    }

    generateExecutableJs(xml) {
        var childCount = xml.childNodes.length;

        for (var i = 0; i < childCount; i++) {
            var xmlChild = xml.childNodes[i];
            console.log(xmlChild);
            var name = xmlChild.nodeName.toLowerCase();
            if (name == 'block') {
                this.code += this.blockToExecutableCode(xmlChild);
                this.code += ';\n\n';
            } else if (name == 'variables') {
                var variableCount = xmlChild.childNodes.length;

                for (var j = 0; j < variableCount; j++) {
                    var variable = xmlChild.childNodes[j];

                    const jsLegalName = this.varNameGenerator.renameScratchVariable(variable.innerText);
                    this.variables[jsLegalName] = {
                        scratchName: variable.innerText,
                        local: variable.getAttribute('islocal'),
                        type: variable.getAttribute('type'),
                        cloud: variable.getAttribute('iscloud')
                    };
                }
            }
        }
        return {
            variables: this.variables,
            parameters: this.parameters,
            functions: this.functions,
            code: this.code
        };
    }

    handleChildren(blockChildNodes, blockType) {
        var childrenBlockCode = {
            inputs: {},
            fields: {},
            next: ''
        };
        // handle all control blocks where the user leaves the condition field blank
        if (blockType == 'control_if' ||
            blockType == 'control_if_else' ||
            blockType == 'control_wait_until' ||
            blockType == 'control_repeat_until' ||
            blockType == 'control_while') {
                childrenBlockCode.inputs.CONDITION = 'default_condition()';
        }
        for (var i = 0; i < blockChildNodes.length; i++) {
            var childNode = blockChildNodes[i];
            var name = childNode.nodeName.toLowerCase();
            if (name == 'value') {
                var childBlock = childNode.childNodes[childNode.childNodes.length - 1];
                childrenBlockCode.inputs[childNode.getAttribute('name')] = this.blockToExecutableCode(childBlock);
            } else if (name == 'field') {
                var fieldValue = childNode.textContent;
                var fieldName = childNode.getAttribute('name');
                var param;

                if (fieldName == 'VARIABLE' ||
                    fieldName == 'LIST' ||
                    blockType == 'argument_reporter_boolean' ||
                    blockType == 'argument_reporter_string_number') {
                    param = this.varNameGenerator.getGeneratedName(fieldValue);
                    if (!param) {
                        param = this.varNameGenerator.renameScratchVariable(fieldValue);
                        this.parameters[param] = {
                            scratchName: fieldValue
                        };
                    }
                } else {
                    param = '"' + fieldValue + '"';
                }

                childrenBlockCode.inputs[childNode.getAttribute('name')] = param;
            } else if (name == 'statement') {
                var childBlock = childNode.childNodes[childNode.childNodes.length - 1];
                childrenBlockCode.inputs[childNode.getAttribute('name')] = 'function () {\n' +
                    this.blockToExecutableCode(childBlock) + ';\n}';
            } else if (name == 'next') {
                var nextBlock = childNode.childNodes[0];
                childrenBlockCode.next = '.next(\n' + this.blockToExecutableCode(nextBlock) + ', )';
            } else if (name == 'mutation') {
                var funcName = childNode.getAttribute('proccode');

                if (funcName) { // true for procedure blocks defined by the user
                    var legalisedFuncName = this.varNameGenerator.getGeneratedName(funcName);
                    if (!legalisedFuncName) {
                        legalisedFuncName = this.varNameGenerator.renameScratchVariable(funcName);
                        this.functions[legalisedFuncName] = {
                            scratchName: funcName
                        };
                    }

                    childrenBlockCode.mutation = {
                        name: legalisedFuncName,
                        warp: childNode.getAttribute('warp')
                    };
                }
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

        const type = block.getAttribute('type');

        const childrenBlockCode = this.handleChildren(childNodes, type);

        const inputs = childrenBlockCode.inputs;

        var code = 'this.' + type + '(';

        // ensure mutations are always the first parameter
        if (childrenBlockCode.mutation) {
            code += childrenBlockCode.mutation.name;
            code += ', ';
            code += childrenBlockCode.mutation.warp;
            code += ', ';
        }

        Object.keys(inputs).forEach((input) => {
            code += inputs[input];
            code += ', ';
        });

        code += ')';

        code += childrenBlockCode.next;

        return code;
    }

}
