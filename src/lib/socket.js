import React from "react";

import io from "socket.io-client";

import ScreenCaptureThumbnail from "../containers/screen-capture-thumbnail.jsx";

class SocketTEst extends React.Component {
    constructor (props) {
        super(props);
        this.socketRef = io('http://localhost:8000');
        this.socketRef.emit('create room', props.roomID);
    
        this.socketRef.on('user joined', this.handleUserJoin);
    
        this.socketRef.on('offer', this.handleRecieveCall);
    
        this.socketRef.on('ice-candidate', this.handleNewICECandidateMsg);

        this.state = { studentVideos: {}};
    }
    
    handleUserJoin(userData) {
        this.connectingStudent = userData.id;
    };
    
    handleRecieveCall(incoming) {
        this.peerRef = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        this.peerRef.setRemoteDescription(desc).then(() => {
            return this.peerRef.createAnswer();
        }).then(answer => {
            return this.peerRef.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: this.socketRef.id,
                sdp: this.peerRef.localDescription
            }
            this.socketRef.emit('answer', payload);
        })

        function createPeer() {
            const peer = new RTCPeerConnection({
                iceServers: [
                    {
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
            peer.ontrack = handleTrackEvent;
        
            return peer;
        };
        
        function handleICECandidateEvent(e) {
            if (e.candidate) {
                const payload = {
                    target: this.connectingStudent,
                    candidate: e.candidate,
                }
                this.socketRef.emit("ice-candidate", payload);
            }
        }
        
        function handleTrackEvent(e) {
            this.studentVideos[this.connectingStudent] = e.streams[0];
            this.setState({ studentVideos: this.studentVideos });
        };
    };
    
    
    
    handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);
    
        this.peerRef.addIceCandidate(candidate)
            .catch(e => console.log(e));
    };

    render() {
        return (
            <div>
                {Object.keys(this.state.studentVideos).map(function (key) {
                    return (
                        <ScreenCaptureThumbnail
                            name={key}
                            video={this.state.studentVideos[key]}>
                        </ScreenCaptureThumbnail>
                    );
                })}
            </div>
        )
    }
}



export default SocketTEst;