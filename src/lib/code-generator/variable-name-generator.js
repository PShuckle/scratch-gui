const reservedWords = ['abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
    'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else',
    'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function',
    'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long',
    'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short',
    'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true',
    'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
].concat(Object.getOwnPropertyNames(globalThis));

export default class VariableNameGenerator {
    constructor() {
        this.variables = [];
        this.variableLookup = {};
        this.targets = [];
    }

    generateCounterVariable() {
        var i = 1;
        var variableName = 'count' + i.toString();

        while (this.variables.includes(variableName)) {
            i++;
            variableName = 'count' + i.toString();
        }

        this.variables.push(variableName);

        return variableName;

    }

    renameScratchVariable(scratchVar) {
        const jsVarName = this.generateLegalSymbolName(scratchVar, this.variables);
        
        this.variableLookup[scratchVar] = jsVarName;

        return jsVarName;
    }

    getGeneratedName(scratchVar) {
        return this.variableLookup[scratchVar];
    }

    generateClassName(scratchTargetName) {
        const className = this.generateLegalSymbolName(scratchTargetName, this.targets);

        return className;
    }

    generateLegalSymbolName(scratchName, array) {
        // remove all illegal characters from variable name
        var tempName = scratchName.replace(/[^0-9a-zA-Z_$]/g, "");

        // if variable name starts with a number (which is illegal), add dollar sign in front
        if (/^\d/.test(tempName)) {
            tempName = '$' + tempName;
        }

        var finalName = tempName;

        // ensure variable name is not already in use

        var i = 0;
        while ((array.includes(finalName) ||
                reservedWords.includes(finalName))) {
            i++;
            finalName = tempName + '_' + i.toString();
        }

        array.push(finalName);

        return finalName;
    }
}
