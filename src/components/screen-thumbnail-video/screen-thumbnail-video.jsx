import styles from './screen-thumbnail-video.css';

const ScreenThumbnailVideo = props => {
    return (
        <video className={styles.video} ref={props.video}>
        </video>
    )
}

export default ScreenThumbnailVideo;