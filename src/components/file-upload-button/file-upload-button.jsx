import React, { useState } from "react";

class FileUploadButton extends React.Component {
  constructor(props) {
    super(props);
    this.uploadFile = this.uploadFile.bind(this);
    // this.domToWorkspace = this.domToWorkspace.bind(this);
  }

  uploadFile(event) {
    this.createBlocksFromFile(event.target.files, 0);
  }

  createBlocksFromFile(files, i) {
    console.log(files);
    console.log(i);
    if (i >= files.length) {
      return;
    }

    const file = files[i];

    console.log(file);

    if (file.name == 'project.js' || file.name == 'broadcaster.js' || file.name == 'sprite.js') {
      // increase the delay if there are bugs!
      setTimeout(this.createBlocksFromFile.bind(this, files, i+1), 5);
      return;
    }

    console.log(file);
    let reader = new FileReader();
    reader.readAsText(file);

    if (file.name == 'global-variable-manager.js') {

    }
    else {
      reader.onload = function (e) {
        console.log(e);
        const targets = this.props.vm.runtime.targets;
        for (let j = 0; j < targets.length; j++) {
          var target = targets[j];
          if (target.sprite.name + '.js' == file.name) {
            console.log(file.name);
            console.log(reader.result);
            this.props.vm.setEditingTarget(target.id);
            this.props.generator.javascriptToDom(reader.result);
            console.log(target);
          }
        }
        // this.domToWorkspace(this.javascriptToDom(reader.result));
      };

      reader.onload = reader.onload.bind(this);
    }

    setTimeout(this.createBlocksFromFile.bind(this, files, i+1), 5);
    return;
  }

  // javascriptToDom(javascript) {
  //   return this.props.vm.generator.javascriptToXml(javascript);
  // }

  // domToWorkspace(xml) {
  //   this.props.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(xml, this.props.ScratchBlocks.getMainWorkspace());
  // }

  render() {
    return <span style={{ 'position': 'absolute', 'left': '5rem', 'z-index': '9' }}>
      <input type="file"
        directory=""
        webkitdirectory=""
        name="myFile"
        multiple
        onChange={this.uploadFile} />
    </span>
  }
}

export default FileUploadButton;