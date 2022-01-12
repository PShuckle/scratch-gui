import React, { useState } from "react";

class FileUploadButton extends React.Component {
    constructor(props) {
      super(props);
      this.uploadFile = this.uploadFile.bind(this);
      this.domToWorkspace = this.domToWorkspace.bind(this);
    }
    
    uploadFile(event) {
        let file = event.target.files[0];
        console.log(file);
        
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function(e) {
            this.domToWorkspace(reader.result);
        };

        reader.onload = reader.onload.bind(this); 
    }

    domToWorkspace(xmlString) {
        console.log(xmlString);
        var xml = new DOMParser().parseFromString(xmlString, "text/xml");
        console.log(xml);
        console.dir(xml);
        this.props.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xml.childNodes[0], this.props.ScratchBlocks.getMainWorkspace());
    }
    
    render() {
      return <span style = {{'position':'absolute', 'left':'5rem', 'z-index': '9'}}>
        <input type="file"
        name="myFile"
        onChange={this.uploadFile} />
      </span>
    }
}

export default FileUploadButton;