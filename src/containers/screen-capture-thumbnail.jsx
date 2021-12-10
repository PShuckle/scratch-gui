import React, {
    createRef
} from "react";
import _, { first } from 'lodash'
import VMScratchBlocks from '../lib/blocks';
import VM from 'scratch-vm';


import Box from '../components/box/box.jsx';
import ScreenThumbnailWorkspace from "../components/screen-thumbnail-workspace/screen-thumbnail-workspace.jsx";

const workspace = createRef();

class ScreenCaptureThumbnail extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);
        const vm = new VM();
        this.ScratchBlocks = VMScratchBlocks(vm);

        this.onClick = props.onClick;
        this.name = props.name;
        this.blocks = props.blocks;

        this.workspace = null;

        this.blocksViewRef = createRef();
    }

    componentDidMount() {
        const blocksView = this.blocksViewRef.current;
        const options = {
            media: './static/blocks-media/'
        }
        this.workspace = this.ScratchBlocks.inject(blocksView, options);

        this.workspace.toolbox_.dispose();
        this.workspace.toolbox_ = null;

        for (let i = 0; i < 5; i++) {
            this.workspace.zoomCenter(-1);
        };




        this.displayBlocks();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.blocks, this.props.blocks)) {
            this.displayBlocks();
        }
    }

    displayBlocks() {
        console.log(this.props.blocks);
        this.workspace.clear();
        this.blocks = this.props.blocks;
        for (var blockId in this.blocks) {
            console.log('initialising');
            var block = this.workspace.newBlock(this.blocks[blockId].type, blockId);
            console.log(block);
            block.initSvg();
            block.render();
        }

        for (var blockId in this.workspace.blockDB_) {
            var block = this.workspace.blockDB_[blockId];
            const children = this.blocks[blockId].childBlocks_;
            const inputs = this.blocks[blockId].inputList;
            const parent = this.blocks[blockId].parentBlock_;

            for (var i in children) {
                var childId = children[i];
                var child = this.workspace.blockDB_[childId];
                console.log(this.workspace.blockDB_);
                console.log(childId);
                block.childBlocks_.push(child);
                if (child.previousConnection != null) {
                    block.nextConnection.connect(child.previousConnection);
                }
            }

            for (var i in inputs) {
                var inputBlock = this.workspace.blockDB_[inputs[i]];
                block.inputList[i].connection.connect(inputBlock.outputConnection);
            }

            block.parentBlock_ = this.workspace.blockDB_[parent];
            if (block.parentBlock_ == null) {
                this.workspace.svgBlockCanvas_.appendChild(block.svgGroup_);
            }
            else {
                block.parentBlock_.svgGroup_.appendChild(block.svgGroup_);

                try {
                    this.workspace.removeTopBlock(block);
                } catch (e) {
                    console.log(e);
                }

                
            }


            // this.workspace.cleanUp();
        }
        console.log(this.workspace.topBlocks_);
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