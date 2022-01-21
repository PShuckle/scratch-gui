export default function readableToexecutableJs(js) {
    let endOfLine = js.search(/;\s\s/);

    while (endOfLine != -1) {
        let endOfStack = findEndOfStack(js, endOfLine);

        let childBlocks = js.substring(endOfLine + 1, endOfStack);

        js = js.replaceBetween(endOfLine, endOfStack, '.next(' + childBlocks + '\r\n)');

        endOfLine = js.search(/;\s\s/);

        console.log(js);
    }

    var innermostBracketPattern = /\([^\(\)]*\)/g;

    var innermostBrackets = js.match(innermostBracketPattern);

    const blocksWithTextDropdowns = [
        'motion_goto_menu', 'motion_glideto_menu', 'motion_pointtowards_menu',
        'motion_setrotationstyle', 'looks_costume', 'looks_backdrops',
        'looks_changeeffectby', 'looks_seteffectto', 'looks_gotofrontback',
        'looks_goforwardbackwardlayers', 'looks_costumenumbername',
        'looks_backdropnumbername', 'sound_sounds_menu', 'sensing_touchingobjectmenu',
        'colour_picker', 'sensing_distancetomenu', 'sensing_keyoptions', 'sensing_setdragmode',
        'sensing_of', 'sensing_of_object_menu', 'sensing_current', 'operator_mathop', 'control_stop'
    ];

    while (innermostBrackets) {
        innermostBrackets.forEach(contents => {
            var trimmedContents = contents.substring(1, contents.length - 1);
            if (matchExact(contents, /\(-?\d+\)/)) {
                js = js.replace(contents, 'math_numberbr_OPEN' + trimmedContents + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\+[^+].*\)/)) {
                var params = trimmedContents.split('+');
                js = js.replace(contents, 'operator_addbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\-[^-].*\)/)) {
                var params = trimmedContents.split('-');
                js = js.replace(contents, 'operator_subtractbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\*.*\)/)) {
                var params = trimmedContents.split('*');
                js = js.replace(contents, 'operator_multiplybr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\/.*\)/)) {
                var params = trimmedContents.split('/');
                js = js.replace(contents, 'operator_dividebr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*>.*\)/)) {
                var params = trimmedContents.split('>');
                js = js.replace(contents, 'operator_gtbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*<.*\)/)) {
                var params = trimmedContents.split('<');
                js = js.replace(contents, 'operator_ltbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*==.*\)/)) {
                var params = trimmedContents.split('==');
                js = js.replace(contents, 'operator_equalsbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*&&.*\)/)) {
                var params = trimmedContents.split('&&');
                js = js.replace(contents, 'operator_andbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*\|\|.*\)/)) {
                var params = trimmedContents.split('||');
                js = js.replace(contents, 'operator_orbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(.*%.*\)/)) {
                var params = trimmedContents.split('%');
                js = js.replace(contents, 'operator_modbr_OPEN' + params[0] + ', ' + params[1] + 'br_CLOSE');
            } else if (matchExact(contents, /\(\!.*\)/)) {
                js = js.replace(contents, 'operator_notbr_OPEN' + trimmedContents.substring(1) + 'br_CLOSE');
            } else if (js.includes('for ' + contents)) {
                let forLoopHeader = 'for ' + contents;
                let numRepeats = contents.match(/< .*;/)[0].replaceAll('< ', '').replaceAll(';', '');

                js = js.replace(forLoopHeader, 'control_repeatbr_OPEN' + numRepeats + 'br_CLOSE');
            } else if (contents == '(true)') {
                js = js.replace('while (true)', 'control_foreverbr_OPENbr_CLOSE')
            } else if (js.includes('while ' + contents)) {
                console.log(contents);
                let whileLoopHeader = 'while ' + contents;
                if (contents.includes('(operator_not')) {
                    let condition = contents.substring(0, contents.length - 1).replace('(operator_not', '');

                    js = js.replace(whileLoopHeader, 'control_repeat_untilbr_OPEN' + condition + 'br_CLOSE');
                }
                else {
                    let condition = contents.substring(1, contents.length - 1).replace('(operator_not', '');
                    js = js.replace(whileLoopHeader, 'control_whilebr_OPEN' + condition + 'br_CLOSE');
                }

            } else if (matchExact(contents, /\('.*'\)/)) {
                var parentFunctionHeaderPattern = new RegExp('(\\(|\\n|,)[^,\\n(]*\\(' + trimmedContents + '\\)');

                var parentFunctionHeader = js.match(parentFunctionHeaderPattern)[0];
                var parentFunctionName = parentFunctionHeader.match(/(\(|\s)[^,\s(]*\(/)[0];
                parentFunctionName = parentFunctionName.substring(1, parentFunctionName.length - 1);

                var textInDropdownBlock = false;
                if (blocksWithTextDropdowns.includes(parentFunctionName)) {
                    textInDropdownBlock = true;

                }
                if (!textInDropdownBlock) {
                    js = js.replace(contents, 'textbr_OPEN' + trimmedContents + 'br_CLOSE');
                } else {
                    js = js.replace(contents, 'br_OPEN' + trimmedContents + 'br_CLOSE');
                }
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
            const regexps = [
                /control_repeatbr_OPEN.*br_CLOSE\s\{[^\{\}]*\}/,
                /control_repeat_untilbr_OPEN.*br_CLOSE\s\{[^\{\}]*\}/,
                /control_whilebr_OPEN.*br_CLOSE\s\{[^\{\}]*\}/
            ];

            regexps.forEach(regexp => {
                let matchingStatement = js.match(regexp);

                if (matchingStatement) {
                    let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];
                    let stringToReplace = 'br_CLOSE ' + trimmedStatement;
                    let replacementString = ', function br_OPENbr_CLOSE curl_OPEN\n return ' + trimmedStatement.replaceAll('{\r\n', '').replaceAll('}', 'curl_CLOSE') + 'br_CLOSE';
                    js = js.replace(stringToReplace, replacementString);
                }
            })

            let statementRegex = /control_foreverbr_OPENbr_CLOSE\s\{[^\{\}]*\}/;
            let matchingStatement = js.match(statementRegex);

            if (matchingStatement) {
                let trimmedStatement = matchingStatement[0].match(/\{[^\{\}]*\}/)[0];
                let stringToReplace = 'br_CLOSE ' + trimmedStatement;
                let replacementString = 'function br_OPENbr_CLOSE curl_OPEN\n return ' + trimmedStatement.replaceAll('{\r\n', '').replaceAll('}', 'curl_CLOSE') + 'br_CLOSE';
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
