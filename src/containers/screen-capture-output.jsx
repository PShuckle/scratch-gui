import React, {
} from "react";
import PropTypes from 'prop-types';
import VM from 'scratch-vm';
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import Box from '../components/box/box.jsx';
import StageWrapper from './stage-wrapper.jsx';
import storage from '../lib/storage';
import GUI from '../containers/gui.jsx';
import Player from './screen-capture-output-stage.jsx';
import { STAGE_SIZE_MODES } from '../lib/layout-constants.js';


const ScreenCaptureOutput = props => {
    const defaultVM = new VM();
    defaultVM.attachStorage(storage);

    const mockStore = configureMockStore();
    const store = mockStore({});


    return (
        <Box>
            <video id="video"
                tabIndex='-1'
                style={{ "border": "1px solid #999", "width": "98%", "maxWidth": "860px" }}
                draggable='true'
                onClick={props.onClick}
                onMouseDown={props.onMouseDown}
                onMouseUp={props.onMouseUp}
                onDragStart={props.onDragStart}
                onDrag={props.onDrag}
                onDragEnd={props.onDragEnd}
                onKeyDown={props.onKeyDown}
                onWheel={props.onWheel}
                autoPlay
                ref={props.video}>
            </video>
            {/* <Provider store={store}>
                <StageWrapper
                    isFullScreen={false}
                    isRendererSupported={true}
                    isRtl={false}
                    loading={false}
                    stageSize={STAGE_SIZE_MODES.large}
                    vm={defaultVM}
                ></StageWrapper>
            </Provider> */}
            {/* <Provider store={store}>
                <GUI
                    canEditTitle
                    enableCommunity
                    isPlayerOnly
                // projectId={'547644607'}
                />
            </Provider> */}
            <Player/>
        </Box >

    )
}

ScreenCaptureOutput.propTypes = {
    video: PropTypes.instanceOf(MediaStream)
};

export default ScreenCaptureOutput;
