import React from 'react'
import axios from 'axios'

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';




class Form extends React.Component{
  constructor(props){
    super(props);
    this.state = (
      {
        title: '',
        start_date: '',
        end_date: '',
        location: '',
        place: '',
        description: ''
      }
    )
    this.handleCreateNewEvent = this.handleCreateNewEvent.bind(this)
  }
  handleCreateNewEvent(){
    axios.post('/api/v1/events/', this.state)
    .then(function(response){
      document.location.href += `/${response.data}`
    })
  }
  render(){
    return(
      <form>
        <TextField
          hintText="Title"
          floatingLabelText="Title"
          floatingLabelFixed={false}
          value={this.state.title}
          onInput={(e)=>this.setState({title: e.target.value})}
        /><br/>
        <TextField
          hintText="Start Date"
          floatingLabelText="Start Date"
          floatingLabelFixed={false}
          value={this.state.start_date}
          onInput={(e)=>this.setState({start_date: e.target.value})}
        /><br/>
        <TextField
          hintText="End Date"
          floatingLabelText="End Date"
          floatingLabelFixed={false}
          value={this.state.end_date}
          onInput={(e)=>this.setState({end_date: e.target.value})}
        /><br/>
        <TextField
          hintText="Description"
          floatingLabelText="Fixed Floating Label Text"
          floatingLabelFixed={false}
          value={this.state.description}
          onInput={(e)=>this.setState({description: e.target.value})}
        /><br/>
        <TextField
          hintText="Location"
          floatingLabelText="Location"
          floatingLabelFixed={false}
          value={this.state.location}
          onInput={(e)=>this.setState({location: e.target.value})}
        /><br/>
        <TextField
          hintText="Place"
          floatingLabelText="Place"
          floatingLabelFixed={false}
          value={this.state.place}
          onInput={(e)=>this.setState({place: e.target.value})}
        /><br/>
        <input type="button" onClick={this.handleCreateNewEvent} value="Create"/>
      </form>
    )
  }
}



export default class CreateEventDialog extends React.Component {
  constructor(props){
      super(props);
      this.state = ({open: false})
      this.handleOpen = this.handleOpen.bind(this)
      this.handleClose = this.handleClose.bind(this)
  }
  handleOpen(){
    this.setState({open: true});
  };

  handleClose(){
    this.setState({open: false});
  };
  render() {

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={false}
        onTouchTap={this.handleClose}
        disabled={true}
      />,
    ];

    return (
      <div>
        <FloatingActionButton onTouchTap={this.handleOpen} className="add_button_wrapper">
          <ContentAdd/>
        </FloatingActionButton>
        <Dialog
          actions={actions}
          modal={false}
          open={this.state.open}
          title="New Event"
          titleClassName="event_form_header"
          onRequestClose={this.handleClose}
          contentStyle={{marginTop: '-50px', width:'450px'}}
          bodyClassName="modal-body"
          bodyStyle={{minHeight: '500px'}}
        >
          <Form />
        </Dialog>
      </div>
    );
  }
}