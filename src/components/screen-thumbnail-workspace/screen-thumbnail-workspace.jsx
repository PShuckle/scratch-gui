import React, { createRef } from "react";

import Box from "../box/box.jsx";

import styles from './screen-thumbnail-workspace.css'

class ScreenThumbnailWorkspace extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);
    }

    render() {
        return (
            <div onClick={this.props.onClick}>
                <Box
                    className={styles.workspace}

                />
            </div>
        );
    }

}

export default ScreenThumbnailWorkspace;