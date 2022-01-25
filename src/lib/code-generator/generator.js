import xmlToJavascript from './xml-executable-js';
import javascriptToXml from './executable-js-to-xml';
import executableToReadable from './executable-to-readable-js';
import readableToexecutable from './readable-to-executable-js';
import createJsFiles from './js-file-creator.js';

class Generator {
    constructor(ScratchBlocks, vm) {
        this.ScratchBlocks = ScratchBlocks;
        this.vm = vm;
        console.log(this.vm);
        console.log(this.ScratchBlocks);
        this.workspace = this.ScratchBlocks.getMainWorkspace();
    }

    blocksToJavascript() {
        const files = {};
        this.vm.runtime.targets.forEach((target) => {
            var name = target.sprite.name;
            this.vm.setEditingTarget(target.id);

            const xml = this.ScratchBlocks.Xml.workspaceToDom(this.workspace);
            const parsedXml = xmlToJavascript(xml);
            const js = parsedXml.code;
            const variables = parsedXml.variables;
            const readableJs = executableToReadable(js);
            
            files[name] = {variables: variables, code: readableJs};
        })

        createJsFiles(files);
    }

    javascriptToDom(javascript) {
        const executableJs = readableToexecutable(javascript);
        console.log(executableJs);
        const xml = javascriptToXml(executableJs);
        console.log(this.vm.runtime._editingTarget.sprite.name);
        console.log(xml.childNodes);
        this.ScratchBlocks.Xml.domToWorkspace(xml, this.workspace);
        console.log(this.vm.runtime._editingTarget.sprite.name);
        
    }
}

export default Generator;
