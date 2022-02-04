import xmlToJavascript from './xml-executable-js';
import javascriptToXml from './executable-js-to-xml';
import executableToReadable from './executable-to-readable-js';
import readableToexecutable from './readable-to-executable-js';
import createJsFiles from './js-file-creator.js';
import globalVariablesToDom from './global-variable-loader.js';

class Generator {
    constructor(ScratchBlocks, vm) {
        this.ScratchBlocks = ScratchBlocks;
        this.vm = vm;
        this.workspace = this.ScratchBlocks.getMainWorkspace();
    }

    blocksToJavascript() {
        const files = {};
        this.vm.runtime.targets.forEach((target) => {
            var name = target.sprite.name;
            this.vm.setEditingTarget(target.id);

            const xml = this.ScratchBlocks.Xml.workspaceToDom(this.workspace);
            const xmlJavascriptConverter = new xmlToJavascript();
            const parsedXml = xmlJavascriptConverter.generateExecutableJs(xml);
            const js = parsedXml.code;
            const variables = parsedXml.variables;
            const params = parsedXml.parameters;
            const functions = parsedXml.functions;
            const readableJs = executableToReadable(js);

            files[name] = {
                variables: variables,
                code: readableJs,
                params: params,
                functions: functions
            };
        })

        createJsFiles(files);
    }

    javascriptToDom(javascript) {
        const executableJs = readableToexecutable(javascript);
        const xml = javascriptToXml(executableJs);
        this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
        this.workspace.cleanUp();
    }

    readGlobalVariables(javascript) {
        const xml = globalVariablesToDom(javascript);
        this.ScratchBlocks.Xml.domToWorkspace(xml, this.workspace);
    }
}

export default Generator;
