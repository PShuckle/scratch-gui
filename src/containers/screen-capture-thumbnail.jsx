import React, {
    createRef
} from "react";
import _ from 'lodash'

import Box from '../components/box/box.jsx';
import ScreenThumbnailWorkspace from "../components/screen-thumbnail-workspace/screen-thumbnail-workspace.jsx";

class ScreenCaptureThumbnail extends React.Component {

    constructor(props) {
        super(props);
        this.vm = props.vm;
        this.ScratchBlocks = props.ScratchBlocks;
        
        this.onClick = props.onClick;
        this.name = props.name;
        this.xml = props.xml;

        this.workspace = null;

        this.blocksViewRef = createRef();
    }

    componentDidMount() {

        // create new workspace
        const blocksView = this.blocksViewRef.current;
        const options = {
            media: './static/blocks-media/'
        }
        this.workspace = this.ScratchBlocks.inject(blocksView, options);

        // remove toolbox and flyout from workspace, leaving only the block canvas
        this.workspace.toolbox_.dispose();
        this.workspace.toolbox_ = null;

        var metrics = this.workspace.getMetrics();

        // zoom workspace out
        this.workspace.zoom(metrics.contentLeft, metrics.contentTop,-5);
        
        this.displayBlocks();
    }

    /**
     * Reset workspace only if the list of blocks has changed since last rendering
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.xml, this.props.xml)) {
            this.displayBlocks();
        }
    }

    /**
     * render the workspace xml received from the student's stream
     */
    displayBlocks() {
        this.workspace.clear();
        this.xmlString = this.props.xml;

        const xml = new DOMParser().parseFromString(this.xmlString, 'text/xml');

        this.ScratchBlocks.Xml.domToWorkspace(xml.childNodes[0], this.workspace);
    }

    render() {
        return (
            <Box>
                <div onClick={this.onClick}>
                    <ScreenThumbnailWorkspace
                        workspaceRef={this.blocksViewRef}
                        onClick={this.onClick}
                    />
                    <p>{this.name}</p>
                </div>
            </Box>
        )
    }

}

export default ScreenCaptureThumbnail;