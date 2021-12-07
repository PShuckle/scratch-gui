import React, {
} from "react";
import PropTypes from 'prop-types';

import Box from '../components/box/box.jsx';
import ScreenThumbnailVideo from "../components/screen-thumbnail-video/screen-thumbnail-video.jsx";

const ScreenCaptureThumbnail = props => {
    return (
        <Box>
            <ScreenThumbnailVideo
                video={props.video}
                onClick={props.onClick}
            >
            </ScreenThumbnailVideo>
            <p>{props.name}</p>
        </Box>
    )
}

export default ScreenCaptureThumbnail;