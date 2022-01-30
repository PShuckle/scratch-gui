import JSZip from 'jszip';

export default function createProject(files) {
    var zip = new JSZip();

    var globalVars = {};

    Object.keys(files).forEach((name) => {
        var fileCode = createFileSkeleton(name);
        var generatedJsCode = files[name].code;
        var variables = files[name].variables;

        Object.keys(variables).forEach(variable => {
            var init = '0';
            if (variables[variable].type == 'list') {
                init = '[]';
            }
            if (variables[variable].local == 'true') {
                fileCode = fileCode.replace('super(broadcaster);',
                    'super(broadcaster);\nthis.' + variable + ' = ' + init + ';');
            } else {
                globalVars[variable] = init;

            }
        })

        var codeSnippets = generatedJsCode.split('\n\n');

        var procedures = '';

        codeSnippets.forEach(snippet => {
            if (snippet.includes('event_whenflagclicked')) {
                // remove first line of code from snippet 
                // - this is the code representing the hat block
                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);

                fileCode = fileCode.replace(`event_whenflagclicked() {`,
                    `event_whenflagclicked() {
                        setTimeout(function() {
                        ` + trimmedSnippet + `
                    }, 0)`)


            }
            if (snippet.includes('event_whenkeypressed')) {
                var keyPressPattern = /(?:event_whenkeypressed\()(?<keyname>[^()]*)(?:\))/g;
                var key = keyPressPattern.exec(snippet);

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);

                fileCode = fileCode.replace(`event_whenkeypressed(key) {`,
                    `event_whenkeypressed(key) {
                        if ((key == ` + key.groups.keyname + `)) {
                                setTimeout(function() {
                                ` + trimmedSnippet + `
                            }, 0)
                        }`)
            }
            if (snippet.includes('event_whenthisspriteclicked')) {
                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replace(`event_whenthisspriteclicked() {`,
                    `event_whenthisspriteclicked() {
                        setTimeout(function() {
                        ` + trimmedSnippet + `
                    }, 0)`)
            }

            if (snippet.includes('event_whenbackdropswitchesto')) {
                var backdropPattern = /(?:event_whenbackdropswitchesto\()(?<backdropname>[^()]*)(?:\))/;
                var backdrop = backdropPattern.exec(snippet);

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replace(`event_whenbackdropswitchesto(backdrop) {`,
                    `event_whenbackdropswitchesto(backdrop) {
                        if ((backdrop == ` + backdrop.groups.backdropname + `)) {
                                setTimeout(function() {
                                ` + trimmedSnippet + `
                            }, 0)
                        }`)
            }

            if (snippet.includes('event_whengreaterthan')) {
                var greaterThanPattern = /(?:event_whengreaterthan\()(?<whengreaterthanmenu>[^,]*?), (?<value>[^\n]*?)(?:\);)/;
                var greaterThan = greaterThanPattern.exec(snippet);

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);

                fileCode = fileCode.replace(`event_whengreaterthan() {`,
                    `event_whengreaterthan() {
                        if ((` + greaterThan.groups.whengreaterthanmenu + ` > ` +
                    greaterThan.groups.value + `)) {
                                    setTimeout(function() {
                                    ` + trimmedSnippet + `
                                }, 0)
                            }`)
            }

            if (snippet.includes('event_whenbroadcastreceived')) {
                var messagePattern = /(?:event_whenbroadcastreceived\()(?<messagetext>[^()]*)(?:\))/;
                var message = messagePattern.exec(snippet);

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replace(`event_whenbroadcastreceived(message) {`,
                    `event_whenbroadcastreceived(message) {
                        if ((message == ` + message.groups.messagetext + `)) {
                                setTimeout(function() {
                                ` + trimmedSnippet + `
                            }, 0)
                        }`)
            }

            if (snippet.includes('control_start_as_clone')) {
                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);

                fileCode = fileCode.replace(`control_start_as_clone() {`,
                    `control_start_as_clone() {
                        setTimeout(function() {
                        ` + trimmedSnippet + `
                    }, 0)`)
            }

            if (snippet.includes('procedures_definition')) {
                var functionNamePattern = /(?:procedures_prototype\(\')(?<funcName>.*?)(?:\')/
                var functionParamPattern = /(?:argument_reporter_.*?\(\')(?<name>.*?)(?:\'\))/g
                var func = functionNamePattern.exec(snippet);
                var params = '';
                var param;
                while (param = functionParamPattern.exec(snippet)) {
                    params += param.groups.name + ', ';
                }

                var trimmedSnippet = snippet.substring(snippet.indexOf('});') + 3);

                procedures += func.groups.funcName + `(` +
                    params.substring(0, params.lastIndexOf(',')) + `) {` + trimmedSnippet + '\n}\n\n'


            }
        })

        fileCode = fileCode.replace('PROCEDURES_DEFINITIONS', procedures);

        var fileName = name + '.js';

        zip.file(fileName, fileCode);
    });

    zip.file('project.js', createProjectFile(files));
    zip.file('broadcaster.js', createBroadcasterFile(files));
    zip.file('sprite.js', createSpriteFile(files));
    zip.file('global-variable-manager.js', createGlobalVariableManager(globalVars));

    zip.generateAsync({
            type: "blob"
        })
        .then(function (content) {
            // see FileSaver.js
            var a = document.createElement("a");
            var url = URL.createObjectURL(content);
            a.href = url;
            a.download = 'project.zip';
            document.body.appendChild(a);
            a.click();
        });
}

function createFileSkeleton(name) {
    const fileCode = `import Sprite from './sprite.js';

    class ` + name + ` extends Sprite {
        constructor (broadcaster) {
            super(broadcaster);
        }

        event_whenflagclicked() {

        }

        event_whenkeypressed(key) {

        }

        event_whenthisspriteclicked() {

        }

        event_whenbackdropswitchesto(backdrop) {

        }

        event_whengreaterthan() {

        }

        event_whenbroadcastreceived(message) {

        }

        control_start_as_clone() {

        }

        PROCEDURES_DEFINITIONS

    }

    export default ` + name + `;`;

    return fileCode;

}

function createProjectFile(files) {
    var code = `import Broadcaster from './broadcaster.js';
    import GlobalVariableManager from './global-variable-manager.js;
    `

    Object.keys(files).forEach((name) => {
        code += 'import ' + name + ' from \'./' + name + '.js\';\n';
    });

    code += `
    const broadcaster = new Broadcaster();
    const varManager = new GlobalVariableManager();
    
    const targets = {\n`;
    Object.keys(files).forEach((name) => {
        code += name + ': new ' + name + '(broadcaster, varManager),\n';
    });
    code += `};
    
    broadcaster.setTargets(targets);
    
    Object.keys(targets).forEach(targetName => {
        targets[targetName].event_whenflagclicked();
    });`

    return code;
}

function createBroadcasterFile(files) {
    var code = `
    class Broadcaster {
        constructor () {
            this.targets = {};
        }
    
        broadcast(message) {
            Object.keys(this.targets).forEach(targetName => {
                this.targets[targetName].event_whenbroadcastreceived(message);
            })
        }
    
        setTargets(targets) {
            this.targets = targets;
        }
    }
    
    export default Broadcaster;`

    return code;
}

function createSpriteFile() {
    return `class Sprite {
        constructor(broadcaster, varManager) {
            this.x = 0;
            this.y = 0;
            this.direction = 90;
    
            this.broadcaster = broadcaster;
            this.varManager = varManager;
        }
    
        motion_movesteps(steps) {
            // change this.x and this.y accordingly
        }
    
    }
    
    export default Sprite;`
}

function createGlobalVariableManager(vars) {
    var code = `class GlobalVariableManager {
        constructor () {
            this.variables = {
                `
    Object.keys(vars).forEach((variable) => {
        code += variable + ': ' + vars[variable] + ',\n'
    })
    code += `};
        }
    
        addVariable(name) {
            this.variables[name] = 0;
        }
    
        setVariable(name, value) {
            this.variables[name] = value;
        }
    }
    
    export default GlobalVariableManager;`

    return code;
}
