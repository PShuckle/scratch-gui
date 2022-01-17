import xmlToJavascript from './xml-executable-js';
import javascriptToXml from './executable-js-to-xml';

class Generator {
    constructor (ScratchBlocks) {
        this.ScratchBlocks = ScratchBlocks;
        this.workspace = this.ScratchBlocks.getMainWorkspace();
    }

    blocksToJavascript() {
        const xml = this.ScratchBlocks.Xml.workspaceToDom(this.workspace);
        const js = xmlToJavascript(xml);
    }

    javascriptToDom(javascript) {
        const xml = javascriptToXml(javascript);
        this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
}

export default Generator;