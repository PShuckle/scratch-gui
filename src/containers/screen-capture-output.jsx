import React, {
} from "react";
import PropTypes from 'prop-types';

import Box from '../components/box/box.jsx';


const ScreenCaptureOutput = props => {
    return (
        <Box>
            <video id="video"
                style={{ "border": "1px solid #999", "width": "98%", "maxWidth": "860px" }}
                draggable = 'true'
                onClick = {props.onClick}
                onMouseDown = {props.onMouseDown}
                onMouseUp = {props.onMouseUp}
                onDragStart = {props.onDragStart}
                onDrag = {props.onDrag}
                onDragEnd = {props.onDragEnd}
                onKeyDown = {props.onKeyDown}
                onWheel = {props.onWheel}
                autoPlay 
                ref={props.video}></video>
        </Box >
        
    )
}

ScreenCaptureOutput.propTypes = {
    video: PropTypes.instanceOf(MediaStream)
};

export default ScreenCaptureOutput;
