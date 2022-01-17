/**
 * 
 * @param {!Element} xml 
 */
export default function domToExecutableJavascript(xml) {

    var code = '';

    var childCount = xml.childNodes.length;

    for (var i = 0; i < childCount; i++) {
        var xmlChild = xml.childNodes[i];
        console.log(xmlChild);
        var name = xmlChild.nodeName.toLowerCase();
        if (name == 'block') {
            code += blockToExecutableCode(xmlChild);
            code += ';\n\n';
        }
    }
    console.log(code);
    return code;
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
            childrenBlockCode.inputs[childNode.getAttribute('name')] = blockToExecutableCode(childBlock);
        } else if (name == 'field') {
            childrenBlockCode.inputs[childNode.getAttribute('name')] = childNode.textContent;
        } else if (name == 'statement') {
            childrenBlockCode.inputs[childNode.getAttribute('name')] = '{' +
                blockToExecutableCode(childBlock) + '}';
        } else if (name == 'next') {
            var nextBlock = childNode.childNodes[0];
            childrenBlockCode.next = '.next(\n' + blockToExecutableCode(nextBlock) + ')';
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

    Object.keys(inputs).forEach((input) => {
        code += inputs[input];
        code += ', ';
    });

    code += ')';

    code += childrenBlockCode.next;

    return code;
}
