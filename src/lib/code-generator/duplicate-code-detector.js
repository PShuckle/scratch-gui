export default function detectDuplicateCode(xml) {
    var childCount = xml.childNodes.length;

    var stacks = [];

    for (let i = 0; i < childCount; i++) {
        var xmlChild = xml.childNodes[i];
        var name = xmlChild.nodeName.toLowerCase();
        if (name == 'block') {
            stacks.push(generateBlocksArray(xmlChild));
        }
    }

    for (let j = 0; j < stacks.length; j++) {
        for (let k = 0; k < j; k++) {
            var subsetData = findLongestCommonSubset(stacks[j], stacks[k]);
            if (subsetData.endIndex - subsetData.startIndex >= 3) {
                for (let m = subsetData.startIndex; m <= subsetData.endIndex; m++) {
                    if (stacks[j][m].node) {
                        stacks[j][m].node.setAttribute('duplicate', true);
                    }
                }
            }
        }
    }

}

function generateBlocksArray(topBlock) {
    var blocksArray = [];
    addBlockToArray(blocksArray, topBlock);
    return blocksArray;
}

function addBlockToArray(blocksArray, block) {
    const childNodes = block.childNodes;
    const type = block.getAttribute('type');
    blocksArray.push({type: type, node: block});
    for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i].nodeName.toLowerCase() == 'statement') {
            addBlockToArray(blocksArray, childNodes[i].firstChild);
            blocksArray.push({type: 'statement_end'});
        } else if (childNodes[i].nodeName.toLowerCase() == 'next') {
            addBlockToArray(blocksArray, childNodes[i].firstChild);
        }
    }
}

function findLongestCommonSubset(stack1, stack2) {
    var longestSubsetLookup = make2dArray(stack1.length, stack2.length);
    var longestSubsetLength = 0;
    var endIndex = 0;
    for (let i = 0; i < stack1.length; i++) {
        for (let j = 0; j < stack2.length; j++) {
            if (stack1[i].type == stack2[j].type) {
                if (i == 0 || j == 0) {
                    longestSubsetLookup[i][j] = 1;
                }
                else {
                    longestSubsetLookup[i][j] = longestSubsetLookup[i - 1][j - 1] + 1
                }
                if (longestSubsetLookup[i][j] > longestSubsetLength) {
                    longestSubsetLength = longestSubsetLookup[i][j];
                    endIndex = i;
                }
            } else {
                longestSubsetLookup[i][j] = 0;
            }
        }
    }

    return {endIndex: endIndex, startIndex: endIndex - longestSubsetLength + 1};
}

function make2dArray(x, y) {
    var arr = [];
    for(let i = 0; i < x; i++) {
        arr.push(new Array(y));
    }
    return arr;
}