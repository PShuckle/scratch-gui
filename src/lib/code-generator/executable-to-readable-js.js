export default function executableToReadableJs(js) {
    js = replaceFunctionWith(js, 'math_number', (params) => {
        return '(' + params[0] + ')';
    });

    js = replaceFunctionWith(js, 'operator_add', (params) => {
        return '(' + params[0] + ' + ' + params[1] + ')';
    });

    js = replaceFunctionWith(js, '.next', (params) => {
        return ';' + params[0];
    });

    js = js.replaceAll(', )', ')');
    console.log(js);
}

String.prototype.endIndexOf = function (substring) {
    var startIndex = this.indexOf(substring);
    var endIndex = startIndex == -1 ? -1 : startIndex + substring.length + 1;
    return endIndex;
}

String.prototype.replaceBetween = function (start, end, replacementSubstring) {
    return this.substring(0, start) + replacementSubstring + this.substring(end);
};

function replaceFunctionWith(js, func, replacementStringBuilder) {
    while (js.endIndexOf(func) != -1) {
        const functionData = parseFunction(js, js.endIndexOf(func));

        js = js.replaceBetween(js.indexOf(func), functionData.endIndex, replacementStringBuilder(functionData.params));
        console.log(js);
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
