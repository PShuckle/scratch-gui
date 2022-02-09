export default function readableToexecutableJs(js) {
    var symbolNameLookup = getSymbolNameLookup(js);
    var functionWarpLookup = getFunctionWarpLookup(js);
    var vars = getVariables(js);

    js = trimJsFile(js);

    let endOfLine = js.search(/;\n/);

    while (endOfLine != -1) {
        let endOfStack = findEndOfStack(js, endOfLine);

        let childBlocks = js.substring(endOfLine + 1, endOfStack);

        js = js.replaceBetween(endOfLine, endOfStack, '.next(' + childBlocks + '\n)');

        endOfLine = js.search(/;\n/);
    }

    js = js.replaceAll('this.', '');

    var functions = js.split('}\n\n');

    for (let i = 0; i < functions.length; i++) {
        var currentFunc = functions[i].trim();

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

            let conditions = functionBody.split(/\}\s*?if/);

            let threads = handleFunctionThreads(functionBody);

            var executableCode = '';

            for (let i = 0; i < conditions.length; i++) {
                const func = conditions[i];
                const keyMatch = func.match(/\".*\"/);

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

            var warp = functionWarpLookup[functionHeader];
            var parameterTypes = symbolNameLookup[functionHeader].match(/%./g);
            var paramsAsStrings = '';

            var parameterList = params.groups.params.split(', ');

            if (parameterTypes) {
                for (let i = 0; i < parameterTypes.length; i++) {
                    if (parameterTypes[i] == '%s' || parameterTypes[i] == '%n') {
                        paramsAsStrings += "argument_reporter_string_number(" +
                            parameterList[i] + "), ";
                    } else if (parameterTypes[i] == '%b') {
                        paramsAsStrings += "argument_reporter_boolean(" +
                            parameterList[i] + "), ";
                    }
                }
            }

            let replacementString = 'procedures_definition(function () {\n procedures_prototype(' + functionHeader +
                ', ' + warp + ', ' + paramsAsStrings + `)}).next(
                                ` + functionBody + ')\n';

            functions[i] = replacementString;
        }

    }

    var allFunctionsCode = functions.join('\n');
    allFunctionsCode = allFunctionsCode.replaceAll('function () {\n', 'function () {\nreturn ')

    var symbolsToStrings = '';
    Object.keys(symbolNameLookup).forEach((symbol) => {
        symbolsToStrings += 'var ' + symbol + ' = "' + symbolNameLookup[symbol] + '";\n';
    })

    Object.keys(vars).forEach((variable) => {
        symbolsToStrings += 'var ' + variable + ' = "' + vars[variable].scratchName + '";\n';
    })

    return {
        code: symbolsToStrings + allFunctionsCode,
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

function getVariables(js) {
    var localVarPattern = /this\.(?<name>.*?) = {"value":(?<type>.*?),"isLocal":"(?<isLocal>.*?)","isCloud":"(?<isCloud>.*?)","scratchName":"(?<scratchName>.*?)","jsName":"(?<jsName>.*?)"}/g;

    var variableList = {};

    var variable;

    while (variable = localVarPattern.exec(js)) {
        variableList[variable.groups.name] = {
            type: variable.groups.type,
            isLocal: variable.groups.isLocal,
            isCloud: variable.groups.isCloud,
            scratchName: variable.groups.scratchName
        };
    }

    return variableList;
}

function getSymbolNameLookup(js) {
    var symbolNameLookupPattern = /this.symbolNameLookup = (?<object>{(.|\n)*?})/;
    var symbolNameLookup = JSON.parse(symbolNameLookupPattern.exec(js).groups.object);

    return symbolNameLookup;
}

function getFunctionWarpLookup(js) {
    var functionWarpLookupPattern = /this.functionWarpLookup = (?<object>{(.|\n)*?})/;
    var functionWarpLookup = JSON.parse(functionWarpLookupPattern.exec(js).groups.object);

    return functionWarpLookup;
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

function handleFunctionThreads(functionBody) {
    let threads = functionBody.split('setTimeout');
    for (let i = 0; i < threads.length; i++) {
        let thread = threads[i];
        thread = thread.substring(thread.indexOf('{') + 1, thread.lastIndexOf('}, 0)'))
        threads[i] = thread;
    }

    return threads;
}
