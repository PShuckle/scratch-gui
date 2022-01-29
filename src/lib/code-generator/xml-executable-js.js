/**
 * 
 * @param {!Element} xml 
 */
export default function domToExecutableJavascript(xml) {

    var code = '';
    var variables = {};

    var childCount = xml.childNodes.length;

    for (var i = 0; i < childCount; i++) {
        var xmlChild = xml.childNodes[i];
        console.log(xmlChild);
        var name = xmlChild.nodeName.toLowerCase();
        if (name == 'block') {
            code += blockToExecutableCode(xmlChild);
            code += ';\n\n';
        } else if (name == 'variables') {
            var variableCount = xmlChild.childNodes.length;
            for (var j = 0; j < variableCount; j++) {
                var variable = xmlChild.childNodes[j];
                variables[variable.innerText] = {
                    local: variable.getAttribute('islocal'),
                    type: variable.getAttribute('type')
                };
            }
        }
    }
    return {
        variables: variables,
        code: code
    };
}

function handleChildren(blockChildNodes) {
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
            childrenBlockCode.inputs[childNode.getAttribute('name')] = blockToExecutableCode(childBlock);
        } else if (name == 'field') {
            var fieldValue = childNode.textContent;

            if (isNaN(fieldValue)) {
                fieldValue = '"' + fieldValue + '"';
            }

            childrenBlockCode.inputs[childNode.getAttribute('name')] = fieldValue;
            var childBlock = childNode.childNodes[childNode.childNodes.length - 1];
        } else if (name == 'statement') {
            var childBlock = childNode.childNodes[childNode.childNodes.length - 1];
            childrenBlockCode.inputs[childNode.getAttribute('name')] = '{\n' +
                blockToExecutableCode(childBlock) + ';\n}';
        } else if (name == 'next') {
            var nextBlock = childNode.childNodes[0];
            childrenBlockCode.next = '.next(\n' + blockToExecutableCode(nextBlock) + ', )';
        } else if (name == 'mutation') {
            var funcName = childNode.getAttribute('proccode');

            if (funcName) { // true for procedure blocks defined by the user
                if (funcName.indexOf(' ') != -1) {
                    funcName = funcName.substring(0, funcName.indexOf(' '))
                }
                funcName = funcName.replace(/\W/g, '')
                childrenBlockCode.mutation = "'" +
                    funcName + "'";
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
function blockToExecutableCode(block) {
    const childNodes = block.childNodes;

    const childrenBlockCode = handleChildren(childNodes);

    const inputs = childrenBlockCode.inputs;

    var code = block.getAttribute('type') + '(';

    // ensure mutations are always the first parameter
    if (childrenBlockCode.mutation) {
        code += childrenBlockCode.mutation;
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
