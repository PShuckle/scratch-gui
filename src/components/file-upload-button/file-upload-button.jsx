import React, { useState } from "react";

class FileUploadButton extends React.Component {
  constructor(props) {
    super(props);
    this.uploadFile = this.uploadFile.bind(this);
    // this.domToWorkspace = this.domToWorkspace.bind(this);
  }

  uploadFile(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      
      let file = event.target.files[i];

      if (file.name == 'project.js' || file.name == 'broadcaster.js' || file.name == 'sprite.js') {
        continue;
      }

      console.log(file);

      let reader = new FileReader();
      reader.readAsText(file);

      if (file.name == 'global-variable-manager.js' || file.name == 'Stage.js') {

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
      
    }

    
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