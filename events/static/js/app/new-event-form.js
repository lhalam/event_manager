import React from 'react'
import axios from 'axios'
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {Container, Row, Col} from 'react-grid-system';
import Map from './map';





class Form extends React.Component{
  constructor(props){
    super(props);
    this.state = (
      {
        title: '',
        start_date: new Date().getTime()/1000,
        end_date: new Date().getTime()/1000,
        location: '',
        place: '',
        description: ''
      }
    )
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleStartDateUpdate = this.handleDateUpdate.bind(this)
    this.handleStartTimeUpdate = this.handleTimeUpdate.bind(this)
  }
  handleFormSubmit(){
    axios.post('/api/v1/events/', this.state)
    .then(function(response){
      document.location.href += `/${response.data}`
    })
  }
  handleDateUpdate(value, date){
    let date_time = new Date(date*1000)
    date_time.setFullYear(value.getFullYear())
    date_time.setMonth(value.getMonth())
    date_time.setDate(value.getDate())
    return date_time.getTime()/1000
  }
  handleTimeUpdate(value, date){
    let date_time = new Date(date* 1000)
    date_time.setHours(value.getHours())
    date_time.setMinutes(value.getMinutes())
    date_time.setSeconds(0)
    date_time.setMilliseconds(0)
    return date_time.getTime() /1000
  }
  render(){
    return(
      <div>
        <form>
          <TextField
            floatingLabelText="Title*"
            floatingLabelFixed={false}
            value={this.state.title}
            floatingLabelStyle={{fontWeight: 'normal'}}
            onInput={(e)=>this.setState({title: e.target.value})}
          /><br/>
          <div className="date_time_wrapper">
              <TimePicker
                format="24hr"
                hintText="Start Time*"
                textFieldStyle={{width: '100px', float: 'right'}}
                ref="start_time"
                onChange={(event, value, date=this.state.start_date)=>this.setState({start_date: this.handleTimeUpdate(value, date)})}
              />
              <DatePicker
                hintText="Start Date*"
                textFieldStyle={{width: '100px'}}
                onChange={(event, value, date=this.state.start_date)=>this.setState({start_date: this.handleDateUpdate(value, date)})}
              />
          </div>
          <div className="date_time_wrapper">
              <TimePicker
                format="24hr"
                hintText="End Time*"
                textFieldStyle={{width: '100px', float: 'right'}}
                onChange={(event, value, date=this.state.end_date)=>this.setState({end_date: this.handleTimeUpdate(value, date)})}
              />
              <DatePicker
                hintText="End Date*"
                textFieldStyle={{width: '100px'}}
                onChange={(event, value, date=this.state.end_date)=>this.setState({end_date: this.handleDateUpdate(value, date)})}
              />
          </div>
          <TextField
            floatingLabelText="Place*"
            floatingLabelFixed={false}
            value={this.state.place}
            onInput={(e)=>this.setState({place: e.target.value})}
          /><br/>
          <TextField
            hintText="Description"
            multiLine={true}
            rows={3}
            rowsMax={10}
            onInput={(e)=>this.setState({description: e.target.value})}
          /><br />
          <div>
            <Map />
          </div>
        </form>
        <div className="form-button">
          <FlatButton label="Cancel" primary={true} onClick={this.props.handleClose}/>
          <RaisedButton label="Submit" primary={true} onClick={this.handleFormSubmit}/>
      </div>
      </div>
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
    return (
      <div>
        <FloatingActionButton onTouchTap={this.handleOpen} className="add_button_wrapper">
          <ContentAdd/>
        </FloatingActionButton>
        <Dialog
          modal={false}
          open={this.state.open}
          title="New Event"
          titleClassName="event_form_header"
          onRequestClose={this.handleClose}
          contentStyle={{marginTop: '-50px', width:'400px'}}
          bodyClassName="modal-body"
          bodyStyle={{minHeight: '500px'}}
        >
          <Form handleClose={this.handleClose}/>
        </Dialog>
      </div>
    );
  }
}