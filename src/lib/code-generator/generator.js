import xmlToJavascript from './xml-executable-js';
import javascriptToXml from './executable-js-to-xml';
import executableToReadable from './executable-to-readable-js';
import readableToexecutable from './readable-to-executable-js';

class Generator {
    constructor (ScratchBlocks) {
        this.ScratchBlocks = ScratchBlocks;
        this.workspace = this.ScratchBlocks.getMainWorkspace();
    }

    blocksToJavascript() {
        const xml = this.ScratchBlocks.Xml.workspaceToDom(this.workspace);
        const js = xmlToJavascript(xml);
        executableToReadable(js);
    }

    javascriptToDom(javascript) {
        const executableJs = readableToexecutable(javascript);
        const xml = javascriptToXml(executableJs);
        this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
}

export default Generator;