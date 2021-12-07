import React from 'react';

import styles from './screen-thumbnail-video.css';

const ScreenThumbnailVideo = props => {
    return (
        <video
            className={styles.video}
            ref={props.video}
            onClick={props.onClick}
            autoPlay
        >
        </video>
    )
}

export default ScreenThumbnailVideo;