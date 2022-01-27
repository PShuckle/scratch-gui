export default function readableToexecutableJs(js) {
    var vars = getLocalVariables(js);

    js = trimJsFile(js);
    console.log(js);

    let endOfLine = js.search(/;\n/);

    while (endOfLine != -1) {
        let endOfStack = findEndOfStack(js, endOfLine);

        let childBlocks = js.substring(endOfLine + 1, endOfStack);

        js = js.replaceBetween(endOfLine, endOfStack, '.next(' + childBlocks + '\n)');

        endOfLine = js.search(/;\n/);

        console.log(js);
    }

    var innermostBracketPattern = /\([^\(\)]*\)/g;

    var innermostBrackets = js.match(innermostBracketPattern);

    while (innermostBrackets) {
        innermostBrackets.forEach(contents => {
            var trimmedContents = contents.substring(1, contents.length - 1);
            if (matchExact(contents, /\(-?\d+\)/)) { // math_number
                js = js.replace(contents, 'math_numberbr_OPEN' + trimmedContents + 'br_CLOSE');
            } else if (matchExact(contents, /\('.*'\)/)) { // text
                js = js.replace(contents, 'br_OPENtextbr_OPEN' + trimmedContents + 'br_CLOSEbr_CLOSE');
            } else if (js.includes('for ' + contents)) { // control_repeat (for loop)
                // this needs to be handled before operators as + and < are used in the loop header
                let forLoopHeader = 'for ' + contents;
                let numRepeats = contents.match(/< .*;/)[0].replaceAll('< ', '').replaceAll(';', '');

                js = js.replace(forLoopHeader, 'control_repeatbr_OPEN' + numRepeats + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\+[^+].*\)/)) { // operator_add
                var params = trimmedContents.split('+');
                js = js.replace(contents, 'operator_addbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\-[^-].*\)/)) { // operator_subtract
                var params = trimmedContents.split('-');
                js = js.replace(contents, 'operator_subtractbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\*.*\)/)) { // operator_multiply
                var params = trimmedContents.split('*');
                js = js.replace(contents, 'operator_multiplybr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\/.*\)/)) { // operator_divide
                var params = trimmedContents.split('/');
                js = js.replace(contents, 'operator_dividebr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*>.*\)/)) { // operator_gt (greater than)
                var params = trimmedContents.split('>');
                js = js.replace(contents, 'operator_gtbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*<.*\)/)) { // operator_lt (less than)
                var params = trimmedContents.split('<');
                js = js.replace(contents, 'operator_ltbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*==.*\)/)) { // operator_equals
                var params = trimmedContents.split('==');
                js = js.replace(contents, 'operator_equalsbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*&&.*\)/)) { // operator_and
                var params = trimmedContents.split('&&');
                js = js.replace(contents, 'operator_andbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\|\|.*\)/)) { // operator_or
                var params = trimmedContents.split('||');
                js = js.replace(contents, 'operator_orbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*%.*\)/)) { // operator_mod
                var params = trimmedContents.split('%');
                js = js.replace(contents, 'operator_modbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(\!.*\)/)) { // operator_not
                js = js.replace(contents, 'operator_notbr_OPEN' + trimmedContents.substring(1) + 'br_CLOSE');
            } else if (js.includes('if ' + contents)) { // control_if
                let ifHeader = 'if ' + contents;
                let condition = contents.substring(1, contents.length - 1);

                js = js.replace(ifHeader, 'control_ifbr_OPEN' + condition + 'br_CLOSE');
            } else if (contents == '(true)') { // control_forever (while true)
                js = js.replace('while (true)', 'control_foreverbr_OPENbr_CLOSE')
            } else if (js.includes('while ' + contents)) { // control_repeat_until, control_while (while loops)
                let whileLoopHeader = 'while ' + contents;
                if (contents.includes('(operator_not')) {
                    let condition = contents.substring(0, contents.length - 1).replace('(operator_not', '');

                    js = js.replace(whileLoopHeader, 'control_repeat_untilbr_OPEN' + condition + 'br_CLOSE');
                } else {
                    let condition = contents.substring(1, contents.length - 1);
                    js = js.replace(whileLoopHeader, 'control_whilebr_OPEN' + condition + 'br_CLOSE');
                }

            } else {
                js = js.replace(contents, 'br_OPEN' + trimmedContents + 'br_CLOSE');
            }
        })

        innermostBrackets = js.match(innermostBracketPattern);
    }

    js = js.replaceAll('br_OPEN', '(');
    js = js.replaceAll('br_CLOSE', ')');

    var innermostCurlBracketPattern = /\{[^\{\}]*\}/g;

    var innermostCurlBrackets = js.match(innermostCurlBracketPattern);

    console.log(js);

    while (innermostCurlBrackets) {

        const regexps = [
            /control_repeat\((.| )*?\{[^\{\}]*?\}/,
            /control_repeat_until\((.| )*?\{[^\{\}]*?\}/,
            /control_while\((.| )*?\{[^\{\}]*?\}/,
            /control_if\((.| )*?\{[^\{\}]*?\}/,
        ];

        regexps.forEach(regexp => {
            let matchingStatement = js.match(regexp);

            console.log(matchingStatement);
            console.log(regexp);

            if (matchingStatement) {
                let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];
                let stringToReplace = ') ' + trimmedStatement;
                let replacementString = ', function () curl_OPEN\n return ' + trimmedStatement.replaceAll('{\n', '').replaceAll('}', 'curl_CLOSE') + ')';
                js = js.replace(stringToReplace, replacementString);
            }
        })

        console.log(js);

        let statementRegex = /control_forever\(\)(.|\s)*?\{[^\{\}]*\}/;
        let matchingStatement = js.match(statementRegex);

        if (matchingStatement) {
            let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];
            let stringToReplace = ') ' + trimmedStatement;
            let replacementString = 'function () curl_OPEN\n return ' + trimmedStatement.replaceAll('{\n', '').replaceAll('}', 'curl_CLOSE') + ')';
            js = js.replace(stringToReplace, replacementString);
        }

        console.log(js);

        // handle if-else blocks
        statementRegex = /control_if\([^{}]*\)[^\n]*?else(.|\s)*?\{[^\{\}]*\}/;
        matchingStatement = js.match(statementRegex);

        console.log(js);

        if (matchingStatement) {
            let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];
            let stringToReplace = matchingStatement[0];
            let replacementString = stringToReplace.replace('else ', '');
            replacementString = replacementString.replace('control_if', 'control_if_else');
            js = js.replace(stringToReplace, replacementString);

            console.log(js);

            stringToReplace = ') ' + trimmedStatement;
            replacementString = ', function () curl_OPEN\n return ' +
                trimmedStatement.replaceAll('{\n', '').replaceAll('}', 'curl_CLOSE') + ')';

            js = js.replace(stringToReplace, replacementString);
        }

        console.log(js);

        const functionHeaders = [
            /event_whenflagclicked\(\)[^\n]*?\{[^\{\}]*\}/,
            /event_whenthisspriteclicked\(\)[^\n]*?\{[^\{\}]*\}/,
            /control_start_as_clone\(\)[^\n]*?\{[^\{\}]*\}/
        ]

        functionHeaders.forEach((regexp) => {
            statementRegex = regexp;
            matchingStatement = js.match(statementRegex);

            if (matchingStatement) {
                let func = matchingStatement[0];
                let trimmedStatement = func.match(/\{[^\{\}]*\}/)[0];
                let stringToReplace = func;
                let replacementString = func.substring(0, matchingStatement[0].indexOf(')') + 1) +
                    '.next(\n' + trimmedStatement.replaceAll('{\n', '').replaceAll('}', '') + ')';
                js = js.replace(stringToReplace, replacementString);
            }

            console.log(js);
        })

        const eventDropdownHeaders = [
            /event_whenkeypressed[^\n]*?\{[^\{\}]*\}/,
            /event_whenbackdropswitchesto[^\n]*?\{[^\{\}]*\}/,
            /event_whenbroadcastreceived[^\n]*?\{[^\{\}]*\}/
        ]

        eventDropdownHeaders.forEach(header => {
            matchingStatement = js.match(header);

            if (matchingStatement) {
                let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];

                var functions = (trimmedStatement.split(/CURL_CLOSE\)\s*?control_if/));

                for (let i = 0; i < functions.length; i++) {
                    const func = functions[i];
                    const keyMatch = func.match(/\'.*\'/);

                    if (keyMatch) {
                        const key = keyMatch[0];
                        const functionText = func.substring(func.indexOf('return'), func.lastIndexOf('curl_CLOSE')).replace('return', '');

                        js += matchingStatement[0].substring(0, matchingStatement[0].indexOf('(') + 1) +
                            '\n' + key + `).next(
                        ` + functionText + ')\n';
                    }


                }

                js = js.replace(matchingStatement[0], '');
            }
        })

        const greaterThanHeader = /event_whengreaterthan\(\)[^\n]*?\{[^\{\}]*\}/;
        matchingStatement = js.match(greaterThanHeader);

        if (matchingStatement) {
            let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];

            var functions = (trimmedStatement.split(/CURL_CLOSE\)\s*?control_if/));

            console.log(functions);

            for (let i = 1; i < functions.length; i++) {
                const func = functions[i];
                const key = func.match(/\'.*\'/)[0];
                const value = func.substring(func.indexOf(',') + 1, func.indexOf('), function'));

                const functionText = func.substring(func.indexOf('return'), func.lastIndexOf('curl_CLOSE')).replace('return', '');

                js += 'event_whengreaterthan(' +
                    '\n' + key + ',' + value + `).next(
                    ` + functionText + ')\n';
            }

            js = js.replace(matchingStatement[0], '');
        }

        console.log(js);

        innermostCurlBrackets = js.match(innermostCurlBracketPattern);
        console.log(innermostCurlBrackets);
    }


    js = js.replaceAll('curl_OPEN', '{');
    js = js.replaceAll('curl_CLOSE', '}');

    console.log(js);

    return {
        code: js,
        variables: vars
    };
}

String.prototype.endIndexOf = function (substring) {
    var startIndex = this.indexOf(substring);
    var endIndex = startIndex == -1 ? -1 : startIndex + substring.length + 1;
    return endIndex;
}

String.prototype.replaceBetween = function (start, end, replacementSubstring) {
    return this.substring(0, start) + replacementSubstring + this.substring(end);
};

function trimJsFile(js) {
    js = js.substring(js.indexOf('event_whenflagclicked'), js.lastIndexOf('}'));
    return js;
}

function getLocalVariables(js) {
    var constructorBody = js.substring(js.indexOf('this'), js.indexOf('}'));

    var localVarPattern = /this\.(?<name>.*?) = (?<type>.*?);/g;

    var variableList = {};

    var variable;

    while (variable = localVarPattern.exec(constructorBody)) {
        variableList[variable.groups.name] = variable.groups.type;
    }

    return variableList;
}

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
