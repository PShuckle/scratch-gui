export default function globalVariablesToDom(js) {
    var pattern = /this.variables = {(?<variables>(.|\s)*?)}/
    var constructorBody = pattern.exec(js);

    var localVarPattern = /(?<name>.*?): (?<type>.*?),/g;

    var variableList = {};

    var variable;

    while (variable = localVarPattern.exec(constructorBody.groups.variables)) {
        variableList[variable.groups.name] = variable.groups.type;
    }

    const xml = createVariableXml(variableList);

    return xml;
}

function createVariableXml(variables) {
    const xml = document.createElement('xml');
    const variablesTag = document.createElement('variables');
    xml.appendChild(variablesTag);

    Object.keys(variables).forEach(variable => {
        var variableTag = document.createElement('variable');
        variableTag.setAttribute('islocal', 'false');
        variableTag.setAttribute('type', '');
        if (variables[variable] == '[]') {
            variableTag.setAttribute('type', 'list');
        }
        variableTag.textContent = variable;
        variablesTag.appendChild(variableTag);
    })

    return xml;
}