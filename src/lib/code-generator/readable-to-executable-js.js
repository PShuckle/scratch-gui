export default function readableToexecutableJs(js) {
    let endOfLine = js.search(/;\s\s/);

    while (endOfLine != -1) {
        let endOfStack = findEndOfStack(js, endOfLine);

        let childBlocks = js.substring(endOfLine + 1, endOfStack);

        js = js.replaceBetween(endOfLine, endOfStack, '.next(' + childBlocks + '\r\n)');

        endOfLine = js.search(/;\s\s/);
    }

    var innermostBracketPattern = /\([^\(\)]*\)/g;

    var innermostBrackets = js.match(innermostBracketPattern);

    while (innermostBrackets) {
        innermostBrackets.forEach(contents => {
            var trimmedContents = contents.substring(1, contents.length - 1);
            if (matchExact(contents, /\(\d+\)/)) {
                js = js.replace(contents, 'math_numberbr_OPEN' + trimmedContents + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\+[^+].*\)/)) {
                var params = trimmedContents.split('+');
                js = js.replace(contents, 'operator_addbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (js.includes('for ' + contents)) {
                let forLoopHeader = 'for ' + contents;
                let numRepeats = contents.match(/< .*;/)[0].replaceAll('< ', '').replaceAll(';', '');

                js = js.replace(forLoopHeader, 'control_repeatbr_OPEN' + numRepeats + 'br_CLOSE');
            } else {
                js = js.replace(contents, 'br_OPEN' + trimmedContents + 'br_CLOSE');
            }
            console.log(js);
        })

        innermostBrackets = js.match(innermostBracketPattern);
    }

    var innermostCurlBracketPattern = /\{[^\{\}]*\}/g;

    var innermostCurlBrackets = js.match(innermostCurlBracketPattern);

    while (innermostCurlBrackets) {
        innermostCurlBrackets.forEach(contents => {
            let statementRegex = /control_repeatbr_OPEN.*br_CLOSE\s\{[^\{\}]*\}/;
            let matchingStatement = js.match(statementRegex);

            if (matchingStatement) {
                let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];
                let stringToReplace = 'br_CLOSE ' + trimmedStatement;
                let replacementString = ', function br_OPENbr_CLOSE curl_OPEN\n return ' + trimmedStatement.replaceAll('{\r\n', '').replaceAll('}', 'curl_CLOSE') + 'br_CLOSE';
                js = js.replace(stringToReplace, replacementString);
            }
        })

        innermostCurlBrackets = js.match(innermostCurlBracketPattern);
    }

    js = js.replaceAll('br_OPEN', '(');
    js = js.replaceAll('br_CLOSE', ')');
    js = js.replaceAll('curl_OPEN', '{');
    js = js.replaceAll('curl_CLOSE', '}');

    console.log(js);

    return js;
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
        i++;
        var char = js.charAt(i);

        if (char == '(' || char == '{') {
            braceDepth++;
        } else if (char == ')' || char == '}') {
            braceDepth--;
        }
        
    }

    return i;
}
