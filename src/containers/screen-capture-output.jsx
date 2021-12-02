import React, {
} from "react";
import PropTypes from 'prop-types';

import Box from '../components/box/box.jsx';


const ScreenCaptureOutput = props => {

    console.log(props.video);

    return (
        <Box>
            <video id="video"
                controls
                style={{ "border": "1px solid #999", "width": "98%", "maxWidth": "860px" }}
                autoPlay ref={props.video}></video>
        </Box >
        
    )
}

ScreenCaptureOutput.propTypes = {
    video: PropTypes.instanceOf(MediaStream)
};

export default ScreenCaptureOutput;
