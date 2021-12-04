import React, {
    useRef,
    useEffect
} from "react";
import io from "socket.io-client";

const ScreenCapture = props => {

    const peerRef = useRef();
    const socketRef = useRef();
    const teacher = useRef();
    const userStream = useRef();

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
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
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

        var element = document.elementFromPoint(x,y);

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
    }

    function handleWheelEvent(event) {
        const x = event.x * window.innerWidth;
        const y = event.y * window.innerHeight;

        var element = document.elementFromPoint(x,y);

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
        <button onClick={startStream}>Share Screen</button>
    );

}

export default ScreenCapture;
