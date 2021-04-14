import React, { Component } from 'react';
import Chat from 'twilio-chat';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';

class ChatApp extends Component {
	constructor(props) {
    console.log(props);
    super(props);
    this.state = {
      error: null,
      isLoading: true,
      messages: []
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
  }

  async componentDidMount() {


    const response = await fetch(`https://warm-hollows-35856.herokuapp.com/getTwilioToken?identity=${this.user.id}&room=${this.room}`).
      then(res => res.json())
      .then(data => Chat.create(data.token))
      .then(this.setupChatClient)
      .catch(this.handleError);;
    

    }

	handleError(error) {
	    console.error(error);
	    this.setState({
	      error: 'Could not load chat.'
	    });
	  }


	setupChatClient(client) {    
    this.client = client;
    this.client
      .getChannelByUniqueName('general')
      .then(channel => channel)
      .catch(error => {
        if (error.body.code === 50300) {
          return this.client.createChannel({ uniqueName: 'general' });
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
    this.setState(prevState => ({
      messages: [
        ...prevState.messages,
        this.twilioMessageToKendoMessage(message)
      ]
    }));
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
	      <ChatUI
	        user={this.user}
	        messages={this.state.messages}
	        onMessageSend={this.sendMessage}
          placeholder={"Type a message..."}
	        width={500}
	      />
	    );
	  }
}

export default ChatApp;