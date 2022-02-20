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

    console.log(js);

    const variableNameGenerator = new VariableNameGenerator();

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
        });
    }


    return js;
}

function parseFunction(js, start) {
    var braceDepth = 0;
    var inString = false;

    var i = start;
    var lastParamIndex = start;

    var params = [];

    while (braceDepth >= 0) {
        var char = js.charAt(i);

        if (char == '(' && !inString) {
            braceDepth++;
        } else if (char == ')' && !inString) {
            braceDepth--;
        } else if (char == '"') {
            inString = !inString;
        } else if (char == ',' && braceDepth == 0 && !inString) {
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
