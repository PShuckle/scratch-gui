import React, {
    useRef,
    useEffect
} from "react";
import io from "socket.io-client";
import adapter from 'webrtc-adapter';
import { copyWithin } from "react-style-proptype/src/css-properties";

import SB3Downloader from './sb3-downloader.jsx';

const ScreenCapture = props => {
    const peerRef = useRef();
    const socketRef = useRef();
    const teacher = useRef();
    const userStream = useRef();
    const dataChannel = useRef();
    const sb3Stream = useRef();

    useEffect(() => {
        userStream.current = null;

        socketRef.current = io('http://localhost:8000');

        socketRef.current.on('teacher', streamToTeacher);

        socketRef.current.on('answer', handleAnswer);

        socketRef.current.on('ice-candidate', handleNewICECandidateMsg);

        socketRef.current.on('mouse', handleMouseEvent);

        socketRef.current.on('key', handleKeyEvent);

        socketRef.current.on('wheel', handleWheelEvent);

    }, []);

    /**
     * Join a room and start capturing screen
     */
    function startStream() {
        let roomID = window.prompt("Enter room ID:");
        let name = window.prompt("Enter your name:");

        navigator.mediaDevices.getDisplayMedia({
            audio: false,
            video: true
        }).then(stream => {
            userStream.current = stream;

            socketRef.current.emit('join room', {
                roomID: roomID,
                name: name
            });
        })
    };

    /**
     * Given that the room joined has a teacher present, establish connection with the teacher 
     * and begin streaming
     * @param {*} teacherID the socket ID of the teacher
     */
    function streamToTeacher(teacherID) {
        teacher.current = teacherID;
        peerRef.current = createPeer(teacherID);
        dataChannel.current = peerRef.current.createDataChannel({});
        dataChannel.current.addEventListener('open', event => {
            dataChannel.current.addEventListener('message', (event) => {
                onMessageReceived(event);
            })
            setInterval(function () {
                streamWorkspaceBlocks();
            }, 100);
        })

        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }

    function onMessageReceived(event) {
        if (event.data === 'send project sb3') {
            streamProjectSb3();
        }
        else if (event.data === 'stop sb3 stream') {
            stopStreamProjectSb3();
        }
        else {
            handleScreenControlEvent(JSON.parse(event.data));
        }
    }

    /**
     * Start streaming a JSON representation of all the blocks in the workspace
     */
    function streamWorkspaceBlocks() {
        const workspaceBlocks = props.workspace.current.blockDB_;
        const blocksList = {};
        for (var blockid in workspaceBlocks) {
            const block = workspaceBlocks[blockid];

            // do not share the black 'ghost' blocks that appear temporarily when dragging blocks
            // over the workspace near other blocks
            if (block.colour_ != '#000000') {

                // create a list of the block's children
                const childBlocks_ = [];
                for (var i in block.childBlocks_) {
                    var child = block.childBlocks_[i];
                    if (child.colour_ != '#000000') {
                        childBlocks_.push(child.id);
                    }
                }

                // get the next block in the stack - this is the block directly underneath the current 
                // block
                var nextBlock = null;
                try {
                    nextBlock = block.nextConnection.targetConnection.sourceBlock_;
                    if (nextBlock.colour_ != '#000000') {
                        nextBlock = nextBlock.id;
                    }
                    else {
                        nextBlock = null;
                    }
                }
                catch {

                }

                // create list of the block's inputs - this includes input fields, dropdowns, 
                // and substacks in control blocks
                let inputList = {};
                for (var i in block.inputList) {
                    // ignore icon inputs (such as the arrow on the repeat block) as these are 
                    // automatically generated when the tutor creates a block in the workspace
                    if (block.inputList[i].connection != null && block.inputList[i].connection.targetConnection) {
                        inputList[i] = {};
                        inputList[i]['block'] = block.inputList[i].connection.targetConnection.sourceBlock_.id;

                        // store the type of input - whether it is field, substack, etc
                        inputList[i]['name'] = block.inputList[i].name;
                    }
                }

                // get the block's parent block - this is the previous block in the stack
                var parentBlock_ = null;
                if (block.parentBlock_) {
                    if (block.parentBlock_.colour_ != '#000000') {
                        parentBlock_ = block.parentBlock_.id;
                    }
                }

                // add the block with all previously gathered info into the list of blocks to 
                // be sent to tutor
                blocksList[blockid] = {
                    childBlocks_: childBlocks_,
                    nextBlock: nextBlock,
                    parentBlock_: parentBlock_,
                    inputList: inputList,
                    id: blockid,
                    type: block.type
                };
            }
        }

        const eventData = { blocksList: blocksList, sender: socketRef.current.id }

        const json = JSON.stringify(eventData);
        dataChannel.current.send(json);
    }

    // stream the ArrayBuffer representation of the project to be loaded into the tutor's renderer
    function streamProjectSb3() {
        sb3Stream.current = setInterval(function() {
            // saveProjectSb3 returns a Blob; this needs to be converted to ArrayBuffer
            // for Chrome compatibility
            props.saveProjectSb3().then(content => {
                content.arrayBuffer().then(content => {
                    sendProjectSb3Chunks(content);
                })
            });
        }, 1000);
    }

    /**
     * Split the ArrayBuffer representation of the project into chunks; this is needed to bypass
     * the WebRTC message size limit 
     * @param {} content 
     */
    function sendProjectSb3Chunks(content) {
        var length = content.byteLength;

        // send the total number of bytes to expect for the project
        dataChannel.current.send(length.toString());

        // most browsers have a limit of 65535 bytes
        const chunkSize = 64000;

        // send the next 64000 bytes of data
        for (var i = 0; i < length; i+= chunkSize) {
            var start = i;
            var end = i + chunkSize;
            dataChannel.current.send(content.slice(start, end));
          }
    }

    // stop streaming ArrayBuffer when student's video is no longer active
    function stopStreamProjectSb3() {
        clearInterval(sb3Stream.current);
    }

    /**
     * Create a peer connection with the teacher
     * @param {} teacherID the socket ID of the teacher
     * @returns 
     */
    function createPeer(teacherID) {
        const peer = new RTCPeerConnection({
            iceServers: [{
                urls: "stun:stun.stunprotocol.org"
            },
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(teacherID);

        return peer;
    }

    /**
     * Begin negotiation with the teacher client by creating and sending offer
     * @param {*} teacherID teacherID the socket ID of the teacher
     */
    function handleNegotiationNeededEvent(teacherID) {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: teacherID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit('offer', payload);
        }).catch(e => console.log(e));
    }

    /**
     * Handle the teacher sending an answer in response to the offer
     * @param {*} answer 
     */
    function handleAnswer(answer) {
        const desc = new RTCSessionDescription(answer.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: teacher.current,
                candidate: e.candidate,
            }
            socketRef.current.emit('ice-candidate', payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function handleScreenControlEvent(event) {
        if (event.type === 'mouse') {
            handleMouseEvent(event);
        }
        else if (event.type === 'key') {
            handleKeyEvent(event);
        }
        else if (event.type === 'wheel') {
            handleWheelEvent(event);
        }
        else {
            console.error('Unknown event type');
        }
    }

    /**
     * Allow tutor to control the screen by dispatching mouse events being sent from the tutor 
     * interacting with the video
     * @param {*} event 
     */
    function handleMouseEvent(event) {
        // find the element which the Event should fire on: this should be the same element 
        // that the tutor clicked on
        const x = event.x * window.innerWidth;
        const y = event.y * window.innerHeight;

        var element = document.elementFromPoint(x, y);

        // handle an issue with dragging blocks, where the last mousemove event before mouseup
        // always has negative x and y coordinates
        if (!element) {
            return;
        }

        // fire the event
        element.dispatchEvent(new MouseEvent(event.name,
            {
                clientX: x,
                clientY: y,
                bubbles: true,
                cancelable: true,
                composed: true
            })
        );
    }

    function handleKeyEvent(event) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: event.key, code: event.code }));

        // allow tutor to type into input fields: this cannot be done by dispatching KeyEvents
        if (document.activeElement.classList.contains('blocklyHtmlInput')) {
            if (event.key === 'Backspace') {
                var string = document.activeElement.value;
                document.activeElement.value = string.substring(0, string.length - 1);
            }
            else {
                document.activeElement.value += event.key;
            }
        }
    }

    function handleWheelEvent(event) {
        const x = event.x * window.innerWidth;
        const y = event.y * window.innerHeight;

        var element = document.elementFromPoint(x, y);

        if (!element) {
            return;
        }

        element.dispatchEvent(new WheelEvent('wheel',
            {
                clientX: x,
                clientY: y,
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                deltaZ: event.deltaZ,
                deltaMode: event.deltaMode,
                bubbles: true,
                cancelable: true,
                composed: true
            })
        );
    }

    return (
        <SB3Downloader>{(className, downloadProject, saveProjectSb3) => (
            <div>
                <button onClick={startStream}>Share Screen</button>
            </div>
        )}</SB3Downloader>
    );

}

export default ScreenCapture;
