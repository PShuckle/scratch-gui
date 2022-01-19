export default function readableToexecutableJs(js) {

    let endOfLine = js.search(';');

    while (endOfLine != -1) {
        let endOfStack = findEndOfStack(js, endOfLine);

        let childBlocks = js.substring(endOfLine + 1, endOfStack);

        js = js.replaceBetween(endOfLine, endOfStack, '.next(' + childBlocks + ')');

        console.log(js);

        endOfLine = js.search(';');
    }

    var innermostBracketPattern = /\([^\(\)]*\)/g;

    var innermostBrackets = js.match(innermostBracketPattern);

    while (innermostBrackets) {
        innermostBrackets.forEach(contents => {
            var trimmedContents = contents.substring(1, contents.length - 1);
            if (matchExact(contents, /\(\d+\)/)) {
                js = js.replace(contents, 'math_numberbr_OPEN' + trimmedContents + 'br_CLOSE');
            } 
            else if (matchExact(contents, /\(.*\+.*\)/)) {
                var params = trimmedContents.split('+');
                js = js.replace(contents, 'operator_addbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            }
            else {
                js = js.replace(contents, 'br_OPEN' + trimmedContents + 'br_CLOSE');
            }
            console.log(js);
        })

        innermostBrackets = js.match(innermostBracketPattern);
    }

    // var numberPattern = /\d+/g;

    // var numberBlocks = js.match(numberPattern);

    // // two loops are required to prevent replacing the same number multiple times
    // numberBlocks.forEach(number => {
    //     js = js.replace(number, 'NUM_PLACEHOLDER');
    // })

    // numberBlocks.forEach(number => {
    //     js = js.replace('NUM_PLACEHOLDER', 'math_number(' + number + ')');
    // })

    js = js.replaceAll('br_OPEN', '(');
    js = js.replaceAll('br_CLOSE', ')');

    console.log(js);

    return js;


    //let endOfLine = js.search(';');



    // while (js.endIndexOf('math_number') != -1) {
    //     const functionData = parseFunction(js, js.endIndexOf('math_number'));

    //     js = js.replaceBetween(js.indexOf('math_number'), functionData.endIndex, functionData.params[0]);
    //     console.log(js);
    // }
    // while (js.endIndexOf('.next') != -1) {
    //     const functionData = parseFunction(js, js.endIndexOf('.next'));

    //     js = js.replaceBetween(js.indexOf('.next'), functionData.endIndex, ';' + functionData.params[0]);
    //     console.log(js);
    // }
}

String.prototype.endIndexOf = function (substring) {
    var startIndex = this.indexOf(substring);
    var endIndex = startIndex == -1 ? -1 : startIndex + substring.length + 1;
    return endIndex;
}

String.prototype.replaceBetween = function (start, end, replacementSubstring) {
    return this.substring(0, start) + replacementSubstring + this.substring(end);
};

/**
 * check if a regex is an exact match of a string
 * @param {*} string 
 * @param {*} regex 
 */
function matchExact(string, regex) {
    var match = string.match(regex);
    return match && string === match[0];
}

function findEndOfStack(js, start) {
    var braceDepth = 0;

    var i = start;

    while (braceDepth >= 0 && i < js.length) {
        var char = js.charAt(i);

        if (char == '(' || char == '{') {
            braceDepth++;
        } else if (char == ')' || char == '}') {
            braceDepth--;
        }
        i++;
    }

    return i;
}
