import React, {Component} from 'react';
import './App.scss';
import ChatApp from './ChatApp';
import Participant from './Participant';
import '@progress/kendo-theme-material/dist/all.css';

class Room extends Component {
    constructor(props) {
        super(props);        
        this.state = {

            remoteParticipants: Array.from(this.props.room.participants.values())
        }
        //console.log(this.state.remoteParticipants);Array de participantes remotos

        this.leaveRoom = this.leaveRoom.bind(this);
        this.identity = this.props.room.localParticipant.identity;
        this.roomName = this.props.room.name;        

    }

    componentDidMount() {
        // Add event listeners for future remote participants coming or going
        this.props.room.on('participantConnected', participant => this.addParticipant(participant));
        this.props.room.on('participantDisconnected', participant => this.removeParticipant(participant));

        window.addEventListener("beforeunload", this.leaveRoom);
    }

    componentWillUnmount() {
        this.leaveRoom();
    }

    addParticipant(participant) {
        console.log(`${participant.identity} has joined the room.`);

        this.setState({
            remoteParticipants: [...this.state.remoteParticipants, participant]
        });
    }

    removeParticipant(participant) {
        console.log(`${participant.identity} has left the room`);

        this.setState({
            remoteParticipants: this.state.remoteParticipants.filter(p => p.identity !== participant.identity)
        });
    }

    leaveRoom() {
        this.props.room.disconnect();
        this.props.returnToLobby();
    }

    render() {
        let chat;
        chat= <ChatApp username={this.identity} room={this.roomName}/>;
        let r = this.roomName;
        return (
            
            
            <div className="room">
                <div dangerouslySetInnerHTML={{__html: "Room: "+r}} />

                <div className = "participants">

                    

                    <Participant key={this.props.room.localParticipant.identity} localParticipant="true" participant={this.props.room.localParticipant}/>
                    {
                        this.state.remoteParticipants.map(participant =>
                            <Participant key={participant.identity} participant={participant}/>
                        )
                    }
                    
                    <div className="container">
                        <div className="row mt-3">{chat}</div>
                    </div>

                    

                </div>
                <button id="leaveRoom" onClick={this.leaveRoom}>Leave Room</button>
            </div>
        );
    }



}
export default Room;
