import React, { createRef } from "react";

import styles from './screen-thumbnail-workspace.css'

class ScreenThumbnailWorkspace extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div 
                onClick={this.props.onClick}
                ref={this.props.workspaceRef}
                className={styles.workspace}>
            </div>
        );
    }

}

export default ScreenThumbnailWorkspace;