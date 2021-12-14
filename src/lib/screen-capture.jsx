import React, {
    useRef,
    useEffect
} from "react";
import io from "socket.io-client";
import adapter from 'webrtc-adapter';
import { copyWithin } from "react-style-proptype/src/css-properties";

import SB3Downloader from '../containers/sb3-downloader.jsx';

const ScreenCapture = props => {
    const peerRef = useRef();
    const socketRef = useRef();
    const teacher = useRef();
    const userStream = useRef();
    const dataChannel = useRef();

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
            setInterval(function () {
                streamWorkspaceBlocks()
            }, 100);
        })
        // rendererDataChannel.current = peerRef.current.createDataChannel('Binary');
        // rendererDataChannel.current.binaryType = 'blob';

        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }

    function streamWorkspaceBlocks() {
        const workspaceBlocks = props.workspace.current.blockDB_;
        const blocksList = {};
        for (var blockid in workspaceBlocks) {
            const block = workspaceBlocks[blockid];
            // console.log(block);
            if (block.colour_ != '#000000') {
                const childBlocks_ = [];
                for (var i in block.childBlocks_) {
                    var child = block.childBlocks_[i];
                    if (child.colour_ != '#000000') {
                        childBlocks_.push(child.id);
                    }
                }

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

                let inputList = {};
                for (var i in block.inputList) {
                    if (block.inputList[i].connection != null && block.inputList[i].connection.targetConnection) {
                        inputList[i] = {};
                        inputList[i]['block'] = block.inputList[i].connection.targetConnection.sourceBlock_.id;
                        inputList[i]['name'] = block.inputList[i].name;
                    }
                }
                var parentBlock_ = null;
                if (block.parentBlock_) {
                    if (block.parentBlock_.colour_ != '#000000') {
                        parentBlock_ = block.parentBlock_.id;
                    }
                }

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

    function streamWorkspaceSb3(saveProjectSb3) {
        // saveProjectSb3 returns a Blob; this needs to be converted to ArrayBuffer
        // for Chrome compatibility
        saveProjectSb3().then(content => {
            content.arrayBuffer().then(content => {
                dataChannel.current.send(content);
            })
        })
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

    function handleMouseEvent(event) {
        const x = event.x * window.innerWidth;
        const y = event.y * window.innerHeight;

        var element = document.elementFromPoint(x, y);

        if (!element) {
            return;
        }

        element.dispatchEvent(new MouseEvent(event.type,
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
                <button onClick={() => streamWorkspaceSb3(saveProjectSb3)}>Share Renderer</button>
            </div>
        )}</SB3Downloader>
    );

}

export default ScreenCapture;
