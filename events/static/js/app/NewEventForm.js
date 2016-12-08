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
        startDate: this.initialDate().startDate / 1000,
        endDate: this.initialDate().endDate / 1000,
        location: '',
        place: '',
        description: '',
        titleChanged: false,
        descriptionChanged: false,
        locationChanged: false
      }
    );
    this.initialDate = this.initialDate.bind(this)
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleStartDateUpdate = this.handleDateUpdate.bind(this)
    this.handleStartTimeUpdate = this.handleTimeUpdate.bind(this)
    this.setLocation = this.setLocation.bind(this)
    this.titleError = this.titleError.bind(this)
    this.startDateError = this.startDateError.bind(this)
    this.descriptionError = this.descriptionError.bind(this)
    this.locationError = this.locationError.bind(this)
    this.formValid = this.formValid.bind(this)
  }

  initialDate(){
    const date = new Date();
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return {
      startDate: date.setHours(date.getHours() + 2),
      endDate: date.setHours(date.getHours() + 1),
    }
  }

  handleFormSubmit(){
    axios.post('/api/v1/events/', {
      title: this.state.title,
      start_date: this.state.startDate,
      end_date: this.state.endDate,
      location: this.state.location,
      place: this.state.place,
      description: this.state.description
    })
    .then(function(response){
      document.location.href += `/${response.data.event_id}`
    })
  }

  handleDateUpdate(value, date){
    let dateTime = new Date(date*1000)
    dateTime.setFullYear(value.getFullYear())
    dateTime.setMonth(value.getMonth())
    dateTime.setDate(value.getDate())
    return String(dateTime.getTime()/1000)
  }

  handleTimeUpdate(value, date){
    let dateTime = new Date(date* 1000)
    dateTime.setHours(value.getHours())
    dateTime.setMinutes(value.getMinutes())
    dateTime.setSeconds(0)
    dateTime.setMilliseconds(0)
    return String(dateTime.getTime() /1000)
  }

  setLocation(address, location){
    this.setState({place: address, location: `${location.lat()},${location.lng()}`})
  }

  titleError(){
    return this.state.title.trim().length < 1 || this.state.title.trim().length > 20
  }
  
  startDateError(){
    const now = new Date().getTime() / 1000
    return this.state.startDate - now < 60 * 15
  }

  endDateError(){
    return this.state.endDate - this.state.startDate < 60 * 15
  }

  descriptionError(){
    return this.state.description.trim().length < 10 || this.state.description.trim().length > 200
  }

  locationError(){
    return !Boolean(this.state.location)
  }

  formValid(){
    return (!this.titleError() &&
            !this.startDateError() &&
            !this.endDateError() &&
            !this.descriptionError() &&
            !this.locationError()
            )
  }

  render(){
    const titleError = (this.titleError() && this.state.titleChanged) ? 'Cannot be empty and more than 20 characters' : ''
    const startDateError = this.startDateError() ? 'Start Date and Time cannot be earlier than now (15 minutes)' : ''
    const endDateError = this.endDateError() ? 'End Date and Time cannot be earlier than Start Date and Time (15 minutes)' : ''
    const descriptionError = (this.descriptionError() && this.state.descriptionChanged) ? 'Cannot be less 10 and more than 200 characters' : ''
    const locationError = (this.locationError() && this.state.locationChanged) ? 'Select Place from a list' : ''
    return(
      <div>
        <form className="eventForm">
          <TextField
            floatingLabelText="Title*"
            errorText={titleError}
            floatingLabelFixed={false}
            value={this.state.title}
            onChange={(e)=>this.setState({title: e.target.value})}
            onBlur={()=>this.setState({titleChanged: true})}
            style={{width: '100%'}}
          /><br/>
          <div className="date_time_wrapper" onBlur={this.startDateError}>
              <TimePicker
                format="24hr"
                floatingLabelText="Start Time*"
                textFieldStyle={{width: '210px', float: 'right'}}
                defaultTime={new Date(this.state.startDate * 1000)}
                onChange={(event, value, date=this.state.startDate)=>this.setState({startDate: this.handleTimeUpdate(value, date)})}
              />
              <DatePicker
                floatingLabelText="Start Date*"
                textFieldStyle={{width: '210px'}}
                defaultDate={new Date(this.state.startDate * 1000)}
                onChange={(event, value, date=this.state.endDate)=>this.setState({startDate: this.handleDateUpdate(value, date)})}
                />
              <span className="error-message">{startDateError}</span>
          </div>
          <div className="date_time_wrapper">
              <TimePicker
                format="24hr"
                floatingLabelText="End Time*"
                defaultTime={new Date(this.state.endDate * 1000)}
                textFieldStyle={{width: '210px', float: 'right'}}
                onChange={(event, value, date=this.state.endDate)=>this.setState({endDate: this.handleTimeUpdate(value, date)})}
              />
              <DatePicker
                floatingLabelText="End Date*"
                textFieldStyle={{width: '210px'}}
                defaultDate={new Date(this.state.endDate * 1000)}
                onChange={(event, value, date=this.state.endDate)=>this.setState({endDate: this.handleDateUpdate(value, date)})}
              />
              <span className="error-message">{endDateError}</span>
          </div>
          <TextField
            hintText="Description*"
            errorText={descriptionError}
            multiLine={true}
            rows={1}
            rowsMax={2}
            onInput={(e)=>this.setState({description: e.target.value})}
            onBlur={()=>this.setState({descriptionChanged: true})}
            style={{width: '100%'}}
          /><br />
          <div>
            <input id="pac-input" 
                  className="controls" 
                  type="text" 
                  placeholder="Address" 
                  onBlur={()=>this.setState({locationChanged: true})}
              />
            <Map new={true} setLocation={this.setLocation}/>
            <span className="error-message">{locationError}</span>
          </div>
        </form>
        <div className="form-button">
          <FlatButton label="Cancel" primary={true} onClick={this.props.handleClose} style={{marginRight: '5px'}}/>
          <RaisedButton label="Create Event" 
            primary={true} 
            onClick={this.handleFormSubmit}
            disabled={!this.formValid()}
          />
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
          modal={true}
          open={this.state.open}
          title="New Event"
          titleClassName="event_form_header"
          onRequestClose={this.handleClose}
          contentStyle={{marginTop: '-60px', width:'525px'}}
          bodyClassName="modal-body"
          bodyStyle={{minHeight: '525px'}}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
        >
          <Form handleClose={this.handleClose}/>
        </Dialog>
      </div>
    );
  }
}
