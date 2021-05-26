import './App.scss';
import React, {Component} from 'react';
import Select from 'react-select';
import Room from './Room';



const { connect } = require('twilio-video');
const mystyle = {

    padding: 5

                                
}

const options = [  
  { value: 'spanish', label: 'Spanish' },
  { value: 'english', label: 'English' },
  { value: 'german', label: 'German' },
];
var hasAudio = false;
var hasVideo = false;
class App extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            identity: '',
            selectedOption: null,
            room: null
        }
        this.inputRef = React.createRef();
        this.joinRoom = this.joinRoom.bind(this);
        this.returnToLobby = this.returnToLobby.bind(this);
        this.updateIdentity = this.updateIdentity.bind(this);
        this.removePlaceholderText = this.removePlaceholderText.bind(this);

        this.gotDevices = this.gotDevices.bind(this);
        navigator.mediaDevices.enumerateDevices().then(this.gotDevices);


    }





    handleChange = selectedOption => {
        this.setState({ selectedOption });
        

    };

    async joinRoom() {

        if (this.state.selectedOption!==null){
            try {

            const response = await fetch(`https://ice2meetubackend.azurewebsites.net/getTwilioToken?identity=${this.state.identity}&room=${this.state.selectedOption.value}`);

            const data = await response.json();
            
            const room = await connect(data.token, {
                name: this.state.selectedOption.value,
                audio: hasAudio,
                video: hasVideo
            });

            this.setState({ room: room });
        }

            catch(err) {
                console.log(err);
            }
        }
        else{
            alert("No ha seleccionado ninguna sala!");
        }
        
    }

    gotDevices(deviceInfos) {


        for (var i = 0; i !== deviceInfos.length; ++i) {
          var deviceInfo = deviceInfos[i];
          if (deviceInfo.kind === 'videoinput') {
            hasVideo=true;
          }
          if (deviceInfo.kind === 'audioinput') {
            hasAudio=true;
          }
        }
      }




    returnToLobby() {
        this.setState({ room: null });
    }


    removePlaceholderText() {
        this.inputRef.current.placeholder = '';

    }


    updateIdentity(event) {
        this.setState({
            identity: event.target.value
        });
    }



    render() {
        const disabled = this.state.identity === '' ? true : false;
        
           
        return (

            <div className="app">
                {
                    this.state.room === null
                        ? <div className="lobby">
                            <input
                                value={this.state.identity}
                                onChange={this.updateIdentity}
                                ref={this.inputRef}
                                onClick={this.removePlaceholderText}
                                placeholder="What's your name?"/>
                            <Select
                                value={this.state.selectedOption}
                                onChange={this.handleChange}
                                options={options}
                              />
                            
                            <div style={mystyle} >
                                <button disabled={disabled} onClick={this.joinRoom}>Join Room</button>
                                
                            </div>
                            
                              
                            
                        </div>

                        : <Room returnToLobby={this.returnToLobby} room={this.state.room} />
                }
            </div>
        );
    }
}

export default App;