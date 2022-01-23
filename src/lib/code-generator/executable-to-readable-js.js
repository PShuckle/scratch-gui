import VariableNameGenerator from "./variable-name-generator";

export default function executableToReadableJs(js) {
    String.prototype.endIndexOf = function (substring) {
        var startIndex = this.indexOf(substring);
        var endIndex = startIndex == -1 ? -1 : startIndex + substring.length;
        return endIndex;
    }

    String.prototype.replaceBetween = function (start, end, replacementSubstring) {
        return this.substring(0, start) + replacementSubstring + this.substring(end);
    };

    const variableNameGenerator = new VariableNameGenerator();

    const basicInputBlocks = [
        /math_number\(/g, /math_whole_number\(/g, /math_angle\(/g, /math_integer\(/g, /text\(/g
    ];

    basicInputBlocks.forEach(block => {
        js = replaceFunctionWith(js, block, (params) => {
            return '(' + params[0] + ')';
        });
    })

    const twoParamOperators = {
        operator_add: ' \+ ',
        operator_subtract: ' \- ',
        operator_multiply: ' \* ',
        operator_divide: ' \/ ',
        operator_gt: ' \> ',
        operator_lt: ' \< ',
        operator_equals: ' \=\= ',
        operator_and: ' \&\& ',
        operator_or: ' \|\| ',
        operator_mod: ' \% '
    }

    Object.keys(twoParamOperators).forEach(operator => {
        js = replaceFunctionWith(js, new RegExp(operator + '\\(', 'g'), (params) => {
            return '(' + params[0] + twoParamOperators[operator] + params[1] + ')';
        });
    });

    js = replaceFunctionWith(js, /operator_not\(/g, (params) => {
        return '(!' + params[0] + ')';
    });

    js = replaceFunctionWith(js, /control_repeat\(/g, (params) => {
        var varName = variableNameGenerator.generateCounterVariable();
        return 'for (let ' + varName + ' = 0; ' + varName + ' < ' + params[0] + '; ' +
            varName + '++) ' + params[1];
    });

    js = replaceFunctionWith(js, /control_forever\(/g, (params) => {
        return 'while (true) ' + params[0];
    });

    js = replaceFunctionWith(js, /control_if\(/g, (params) => {
        return 'if (' + params[0] + ') ' + params[1];
    });

    js = replaceFunctionWith(js, /control_if_else\(/g, (params) => {
        return 'if (' + params[0] + ') ' + params[1] + ' else ' + params[2];
    });

    js = replaceFunctionWith(js, /control_repeat_until\(/g, (params) => {
        return 'while ((!' + params[0] + ')) ' + params[1];
    });

    js = replaceFunctionWith(js, /control_while\(/g, (params) => {
        return 'while (' + params[0] + ') ' + params[1];
    });

    // js = replaceFunctionWith(js, /event_whenflagclicked\(\).next\(/, (params) => {
    //     return 'event_whenflagclicked () {' + params[0] + '\n}';
    // });

    // js = replaceFunctionWith(js, /event_whenkeypressed\([^()]*\).next\(/, (params, match) => {
    //     return match.replace('.next(', '') + ' {' + params[0] + '}';
    // });

    js = replaceFunctionWith(js, /.next\(/g, (params) => {
        return ';' + params[0];
    });

    js = js.replaceAll(', )', ')');
    console.log(js);

    return js;
}

function replaceFunctionWith(js, func, replacementStringBuilder) {
    const matches = js.match(func);

    if (matches) {
        matches.forEach(match => {
            const functionData = parseFunction(js, js.endIndexOf(match));
    
            js = js.replaceBetween(js.indexOf(match), functionData.endIndex, replacementStringBuilder(functionData.params, match));
            console.log(js);
        });
    }
    

    return js;
}

function parseFunction(js, start) {
    var braceDepth = 0;

    var i = start;
    var lastParamIndex = start;

    var params = [];

    while (braceDepth >= 0) {
        var char = js.charAt(i);

        if (char == '(') {
            braceDepth++;
        } else if (char == ')') {
            braceDepth--;
        } else if (char == ',' && braceDepth == 0) {
            params.push(js.substring(lastParamIndex, i));
            lastParamIndex = i + 2;
        }
        i++;
    }

    return {
        params: params,
        endIndex: i
    };
}
