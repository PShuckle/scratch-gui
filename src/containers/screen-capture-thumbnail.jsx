import React, {
    createRef
} from "react";
import _ from 'lodash'
import VMScratchBlocks from '../lib/blocks';

import Box from '../components/box/box.jsx';
import ScreenThumbnailWorkspace from "../components/screen-thumbnail-workspace/screen-thumbnail-workspace.jsx";

class ScreenCaptureThumbnail extends React.Component {

    constructor(props) {
        super(props);
        this.vm = props.vm;
        this.ScratchBlocks = VMScratchBlocks(this.vm);

        this.onClick = props.onClick;
        this.name = props.name;
        this.blocks = props.blocks;

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

        // zoom workspace out
        for (let i = 0; i < 5; i++) {
            this.workspace.zoomCenter(-1);
        };
        
        this.displayBlocks();
    }

    /**
     * Reset workspace only if the list of blocks has changed since last rendering
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.blocks, this.props.blocks)) {
            this.displayBlocks();
        }
    }

    /**
     * render the list of blocks sent from the student's workspace
     */
    displayBlocks() {
        this.workspace.clear();
        this.blocks = this.props.blocks;

        for (var blockId in this.blocks) {
            // render the block
            var block = this.workspace.newBlock(this.blocks[blockId].type, blockId);
            block.initSvg();
            block.render();
        }

        for (var blockId in this.workspace.blockDB_) {
            var block = this.workspace.blockDB_[blockId];
            const children = this.blocks[blockId].childBlocks_;
            const nextBlock = this.blocks[blockId].nextBlock;
            const inputs = this.blocks[blockId].inputList;
            const parent = this.blocks[blockId].parentBlock_;

            // set the block's' children
            for (var i in children) {
                var childId = children[i];
                var child = this.workspace.blockDB_[childId];
                block.childBlocks_.push(child);
            }

            // connect the block to the next block in the stack
            if (nextBlock) {
                block.nextConnection.connect(this.workspace.blockDB_[nextBlock].previousConnection);
            }

            // connect the block to each of its inputs
            for (var i in inputs) {
                var input = inputs[i];
                if (this.workspace.blockDB_[input.block]) {
                    var inputBlock = this.workspace.blockDB_[input.block];
                    // handle substack inputs
                    if (input.name === 'SUBSTACK') {
                        block.inputList[i].connection.connect_(inputBlock.previousConnection);
                    }
                    // handle field and dropdown inputs
                    else {
                        block.inputList[i].connection.connect(inputBlock.outputConnection);
                    }
                }

            }

            // set the block's parent block
            block.parentBlock_ = this.workspace.blockDB_[parent];

            // append the block svg to the parent or to the canvas
            if (block.parentBlock_ == null) {
                this.workspace.svgBlockCanvas_.appendChild(block.svgGroup_);
            }
            else {
                block.parentBlock_.svgGroup_.appendChild(block.svgGroup_);

                // if block has a parent, ensure it is not being considered a top block
                // so that the cleanUp function does not cause a freeze
                try {
                    this.workspace.removeTopBlock(block);
                } catch (e) {
                    console.log(e);
                }
            }

            // neatly arrange the stacks of blocks
            this.workspace.cleanUp();
        }
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