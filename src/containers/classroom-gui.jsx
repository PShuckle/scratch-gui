import React, {
    useRef,
    createRef,
    useEffect
} from "react";


import { nanoid } from 'nanoid';

import Socket from "../lib/socket.js";

import Dropdown from '../components/dropdown/dropdown.jsx';
import Box from '../components/box/box.jsx';
import ScreenCaptureOutput from '../containers/screen-capture-output.jsx';
import ScreenCaptureThumbnail from "./screen-capture-thumbnail.jsx";

class ClassroomGUI extends React.Component {
    constructor() {
        super();

        this.studentVideos = {};
        this.roomID = nanoid();

        this.state = { studentVideos: this.studentVideos };
    }

    displayStudentVideo() {
        const dropdown = document.getElementById('dropdown');
        const studentID = dropdown.value;
        this.activeStudent = studentID;
        this.studentVideo.srcObject = this.studentVideos[studentID];
    }

    handleClick(event) {
        const video = document.getElementById('video');
        video.focus();

        const clickLocation = getClickProportion(event);

        this.socketRef.emit('mouse', {
            studentID: this.activeStudent,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'click'
        });
    }

    handleMouseDown(event) {
        const clickLocation = getClickProportion(event);

        this.socketRef.emit('mouse', {
            studentID: this.activeStudent,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mousedown'
        })

    }

    handleMouseUp(event) {
        const clickLocation = getClickProportion(event);

        this.socketRef.emit('mouse', {
            studentID: this.activeStudent,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mouseup'
        });
    }

    handleDrag(event) {
        const clickLocation = getClickProportion(event);

        this.socketRef.emit('mouse', {
            studentID: this.activeStudent,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mousemove'
        });
    }

    handleDragStart(event) {
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }

    handleDragEnd(event) {
        handleMouseUp(event);
    }

    getClickProportion(event) {
        const video = document.getElementById('video');

        const dimensions = video.getBoundingClientRect();

        const xProportion = (event.clientX - dimensions.x) / dimensions.width;
        const yProportion = (event.clientY - dimensions.y) / dimensions.height;

        return ({ x: xProportion, y: yProportion });
    }

    handleKeyPress(event) {
        const keyEvent = event.nativeEvent;
        this.socketRef.emit('key', {
            studentID: this.activeStudent,
            key: keyEvent.key,
            code: keyEvent.code
        });
    }

    handleWheel(event) {
        const scrollLocation = getClickProportion(event);

        this.socketRef.emit('wheel', {
            studentID: this.activeStudent,
            x: scrollLocation.x,
            y: scrollLocation.y,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode
        });

    }

    render() {
        return (
            <Box>
                <Dropdown></Dropdown>
                {/* <button onClick={displayStudentVideo}>Play video</button> */}
                <Socket roomID={this.roomID}/>
                    
                    {/* <ScreenCaptureOutput
                        video={studentVideo}
                        onClick={handleClick}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onDrag={handleDrag}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onKeyDown={handleKeyPress}
                        onWheel={handleWheel}>
                    </ScreenCaptureOutput> */}
                
                <p>RoomID: {this.roomID}</p>
            </Box>
        );
    }


}

export default ClassroomGUI;