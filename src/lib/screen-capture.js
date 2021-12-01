import React, {
    useRef,
    useEffect
} from "react";
import io from "socket.io-client";

const ScreenCapture = props => {
    // constructor(name, roomID) {
    //     this.name = name;
    //     this.roomID = roomID;
    // }

    const peerRef = useRef();
    const socketRef = useRef();
    const teacher = useRef();
    const userStream = useRef();
    const senders = useRef([]);

    let roomID = window.prompt("Enter room ID:");
    let name = window.prompt("Enter your name:");

    useEffect(() => {
        navigator.mediaDevices.getDisplayMedia({
            audio: false,
            video: true
        }).then(stream => {

            userStream.current = stream;

            socketRef.current = io('http://localhost:8000');
            socketRef.current.emit('join room', {
                roomID: roomID,
                name: name
            });

            socketRef.current.on('teacher', teacherID => {
                streamToTeacher(teacherID);
                teacher.current = teacherID;
            });

            socketRef.current.on('answer', handleAnswer);

            socketRef.current.on('ice-candidate', handleNewICECandidateMsg);
        })

    }, []);

    function streamToTeacher(teacherID) {
        peerRef.current = createPeer(teacherID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }

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

    return (
        null
    );

}

export default ScreenCapture;
