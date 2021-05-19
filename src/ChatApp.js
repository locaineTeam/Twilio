import React, { Component } from 'react';
import Chat from 'twilio-chat';
import { Chat as ChatInterface } from '@progress/kendo-react-conversational-ui';

class ChatApp extends Component {
  constructor(props) {
    
    super(props);
    this.state = {
      error: null,
      isLoading: true,
      messages:[]
    };
    this.room = props.room;

    this.user = {
      id: props.username,
      name: props.username
    };



    this.setupChatClient = this.setupChatClient.bind(this);
    this.messagesLoaded = this.messagesLoaded.bind(this);
    this.messageAdded = this.messageAdded.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.mensajeAspero = null;
    
    
  }


  async initializeIceBreaker(){
    
    
    const text=await fetch(`https://ice2meetubackend.azurewebsites.net/getIceBreaker?language=${this.room}`);
    const iceBreakerText = await text.json();
    
    
    this.state.messages=[{text:iceBreakerText.iceBreakerBody,author:{id:null, name:"ICE BREAKER!"},timestamp:null}]
  }


  async fetchCommand(message, information, funcion){


    const text=await fetch(`https://ice2meetubackend.azurewebsites.net/messages/command/${message}/language/${this.room}`);
    const commandText = await text.json();
    this.mensajeAspero = commandText.message;
    funcion(commandText.message);
    

    

    }

  

  async componentDidMount() {


    const response = await fetch(`https://ice2meetubackend.azurewebsites.net/getTwilioToken?identity=${this.user.id}&room=${this.room}`).
      then(res => res.json())
      .then(data => Chat.create(data.token))
      .then(this.setupChatClient)
      .catch(this.handleError);
    
    }

  handleError(error) {
      console.error(error);
      this.setState({
        error: 'Could not load chat.'
      });
    }


  setupChatClient(client) {      
    this.initializeIceBreaker();
    this.client = client;
    let nombre = this.room;
    this.client
      .getChannelByUniqueName(nombre)
      .then(channel => channel)
      .catch(error => {
        if (error.body.code === 50300) {
          return this.client.createChannel({ uniqueName: nombre });
        } else {
          this.handleError(error);
      }
    })
      .then(channel => {
       this.channel = channel;
       return this.channel.join().catch(() => {});
      })
      .then(() => {
        this.setState({ isLoading: false });
        this.channel.on('messageAdded', this.messageAdded);
      })
      .catch(this.handleError);
    }

    twilioMessageToKendoMessage(message) {
          
      return {

        text: message.body,
        author: { id: message.author, name: message.author },
        timestamp: message.timestamp
        };
    }
    

    

  messagesLoaded(messagePage) {
      
      this.setState({
        messages: messagePage.items.map(this.twilioMessageToKendoMessage)
        });
    }

    messageAdded(message) {

    
    if(message.body[0] === '#'){

      const k = this.fetchCommand(message.body.slice(1),message,(m)=>{
            console.log(m);
            let variable = {body:m,author:this.user.id,timestamp:null};

            this.setState(prevState => (

              {
         
                messages: [
                  ...prevState.messages,
                  this.twilioMessageToKendoMessage(variable)
                ]

              }

            ));
            console.log(message);
            //this.messageAdded(message);
            

      });



    }
    else{
      this.setState(prevState => (

      {
 
        messages: [
          ...prevState.messages,
          this.twilioMessageToKendoMessage(message)
        ]

      }

    ));

    }

  }
  sendMessage(event) {

      
      
      
      this.channel.sendMessage(event.message.text);

  }

  componentWillUnmount() {
    this.client.shutdown();
  }


  render() {
      
      if (this.state.error) {
        return <p>{this.state.error}</p>;
      } else if (this.state.isLoading) {
        return <p>Loading chat...</p>;
      }
      return (
        <div>
          <ChatInterface
            user={this.user}
            messages={this.state.messages}
            onMessageSend={this.sendMessage}
            placeholder={"Type a message..."}
            width={500}
          />
        </div>  
      );
    }
}

export default ChatApp;