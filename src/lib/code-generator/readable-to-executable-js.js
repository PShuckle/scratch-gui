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
    }

    var functions = js.split('}\n\n');

    for (let i = 0; i < functions.length; i++) {
        var currentFunc = functions[i].trim();

        currentFunc = handleRoundBrackets(currentFunc);

        var functionHeader = currentFunc.substring(0, currentFunc.indexOf('('));

        var functionBody = currentFunc.substring(currentFunc.indexOf('{') + 1);

        if (functionHeader == 'event_whenflagclicked' ||
            functionHeader == 'event_whenthisspriteclicked' ||
            functionHeader == 'control_start_as_clone') {

            let threads = handleFunctionThreads(functionBody);

            let replacementString = '';

            // start at i = 1 because the split function will set index zero to be the substring 
            // before the beginning of the first thread
            for (let i = 1; i < threads.length; i++) {
                let thread = threads[i];
                replacementString += functionHeader + '()' +
                    '.next(\n' + thread + ')\n';
            }

            functions[i] = replacementString;
        } else if (functionHeader == 'event_whenkeypressed' ||
            functionHeader == 'event_whenbackdropswitchesto' ||
            functionHeader == 'event_whenbroadcastreceived' ||
            functionHeader == 'event_whengreaterthan') {

            let conditions = functionBody.split(/\}\s*?control_if/);

            let threads = handleFunctionThreads(functionBody);

            var executableCode = '';

            for (let i = 0; i < conditions.length; i++) {
                const func = conditions[i];
                const keyMatch = func.match(/\'.*\'/);

                if (keyMatch) {
                    const key = keyMatch[0];

                    const functionText = threads[i + 1];

                    if (functionHeader == 'event_whengreaterthan') {
                        const value = func.substring(func.indexOf(',') + 1, func.indexOf('), function'));
                        executableCode += functionHeader +
                            '(\n' + key + ',' + value + `).next(
                                ` + functionText + ')\n';
                    } else {
                        executableCode += functionHeader +
                            '(\n' + key + `).next(
                                ` + functionText + ')\n';
                    }
                }
            }

            functions[i] = executableCode;
        } else if (functionHeader) {
            const paramsPattern = /\((?<params>.*?)\)/

            const params = paramsPattern.exec(currentFunc);

            const paramsAsStrings = "argument_reporter_string_number('" +
                params.groups.params.split(', ').join("'), argument_reporter_string_number('") + "')";

            functionBody = handleCurlyBrackets(functionBody);

            let replacementString = 'procedures_definition(procedures_prototype(\'' + functionHeader +
                '\', ' + paramsAsStrings + `)).next(
                                ` + functionBody + ')\n';

            functions[i] = replacementString;
        }

    }

    var allFunctionsCode = functions.join('\n');

    console.log(allFunctionsCode);

    return {
        code: allFunctionsCode,
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
    js = js.substring(js.indexOf('}') + 1, js.lastIndexOf('}'));
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

function handleRoundBrackets(js) {
    var innermostBracketPattern = /\([^\(\)]*\)/g;

    var innermostBrackets = js.match(innermostBracketPattern);

    while (innermostBrackets) {
        innermostBrackets.forEach(contents => {
            var trimmedContents = contents.substring(1, contents.length - 1);
            if (matchExact(contents, /\(-?(\d|\.)+\)/)) { // math_number
                js = js.replace(contents, 'math_numberbr_OPEN' + trimmedContents + 'br_CLOSE');
            } else if (matchExact(contents, /\(".*"\)/)) { // text
                js = js.replace(contents, 'br_OPENtextbr_OPEN' + trimmedContents + 'br_CLOSEbr_CLOSE');
            } else if (js.includes('for ' + contents)) { // control_repeat (for loop)
                // this needs to be handled before operators as + and < are used in the loop header
                let forLoopHeader = 'for ' + contents;
                let numRepeats = contents.match(/< .*;/)[0].replaceAll('< ', '').replaceAll(';', '');

                js = js.replace(forLoopHeader, 'control_repeatbr_OPEN' + numRepeats + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* \+ [^+].*\)/)) { // operator_add
                var params = trimmedContents.split('+');
                js = js.replace(contents, 'operator_addbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* \- [^-].*\)/)) { // operator_subtract
                var params = trimmedContents.split('-');
                js = js.replace(contents, 'operator_subtractbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* \* .*\)/)) { // operator_multiply
                var params = trimmedContents.split('*');
                js = js.replace(contents, 'operator_multiplybr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* \/ .*\)/)) { // operator_divide
                var params = trimmedContents.split('/');
                js = js.replace(contents, 'operator_dividebr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* > .*\)/)) { // operator_gt (greater than)
                var params = trimmedContents.split('>');
                js = js.replace(contents, 'operator_gtbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* < .*\)/)) { // operator_lt (less than)
                var params = trimmedContents.split('<');
                js = js.replace(contents, 'operator_ltbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* == .*\)/)) { // operator_equals
                var params = trimmedContents.split('==');
                js = js.replace(contents, 'operator_equalsbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* && .*\)/)) { // operator_and
                var params = trimmedContents.split('&&');
                js = js.replace(contents, 'operator_andbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* \|\| .*\)/)) { // operator_or
                var params = trimmedContents.split('||');
                js = js.replace(contents, 'operator_orbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.* % .*\)/)) { // operator_mod
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

    return js;
}

function handleCurlyBrackets(js) {
    var innermostCurlBracketPattern = /\{[^\{\}]*\}/g;

    var innermostCurlBrackets = js.match(innermostCurlBracketPattern);

    while (innermostCurlBrackets) {
        const regexp = /(?<header>control_[^\n]*?)(?<param>\([^\n]*?)\) (?<body>\{[^\{\}]*?\})(?<else> else)?/g;

        let match = regexp.exec(js);

        if (match) {
            let stringToReplace = match[0];
            let replacementString = match.groups.header + match.groups.param;
            if (match.groups.header != 'control_forever') {
                replacementString += ', '
            }
            replacementString += match.groups.body.replaceAll('{\n', '').replaceAll('}', '') + ')';
            if (match.groups.else) {
                replacementString = replacementString.replace('control_if', 'control_if_else') + ' else';
            }
            js = js.replace(stringToReplace, replacementString);
        }

        // handle if-else blocks
        let elsePattern = /(?<if>control_if_else\([^{}]*\)[^\n]*?)(?<else>\) else[^\n]*?)(?<body>\{[^\{\}]*\})/;
        match = elsePattern.exec(js);

        if (match) {
            let stringToReplace = match[0];
            let replacementString = match.groups.if+
                ', ' + match.groups.body.replaceAll('{\n', '').replaceAll('}', '') + ')';
            js = js.replace(stringToReplace, replacementString);
        }

        innermostCurlBrackets = js.match(innermostCurlBracketPattern);
    }

    js = js.replaceAll('curl_OPEN', '{');
    js = js.replaceAll('curl_CLOSE', '}');

    return js;
}

function handleFunctionThreads(functionBody) {
    let threads = functionBody.split('setTimeout');
    for (let i = 0; i < threads.length; i++) {
        let thread = threads[i];
        thread = thread.substring(thread.indexOf('{') + 1, thread.lastIndexOf('}, 0)'))
        thread = handleCurlyBrackets(thread);
        threads[i] = thread;
    }

    return threads;
}
