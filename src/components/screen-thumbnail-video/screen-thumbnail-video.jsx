import React from 'react';

import styles from './screen-thumbnail-video.css';

const ScreenThumbnailVideo = props => {
    console.log(props.video);
    return (
        <video className={styles.video} ref={props.video} autoPlay>
        </video>
    )
}

export default ScreenThumbnailVideo;