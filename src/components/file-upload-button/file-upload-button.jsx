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

    reader.onload = function (e) {
      this.domToWorkspace(this.javascriptToDom(reader.result));
    };

    reader.onload = reader.onload.bind(this);
  }

  javascriptToDom(javascript) {
    return this.props.vm.generator.javascriptToXml(javascript);
  }

  domToWorkspace(xml) {
    console.log(xml);
    this.props.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xml, this.props.ScratchBlocks.getMainWorkspace());
  }

  render() {
    return <span style={{ 'position': 'absolute', 'left': '5rem', 'z-index': '9' }}>
      <input type="file"
        name="myFile"
        onChange={this.uploadFile} />
    </span>
  }
}

export default FileUploadButton;