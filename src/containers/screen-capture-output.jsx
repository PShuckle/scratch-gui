import React from 'react';
import PropTypes from 'prop-types';

import Box from '../components/box/box.jsx';

import startCapture from "../lib/screen-capture.js";

class ScreenCaptureOutput extends React.Component {
    constructor() {
        super();
        document.addEventListener("click", function (event) {
            startCapture();
        });


    }
    render() {
        return (
            <Box>
                <video id="video"
                    style={{ "border": "1px solid #999", "width": "98%", "maxWidth": "860px" }}
                    autoPlay></video>
            </Box >
        )
    }
}

export default ScreenCaptureOutput;