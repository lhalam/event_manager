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
        start_date: this.initialDate().start_date / 1000,
        end_date: this.initialDate().end_date / 1000,
        location: '',
        place: '',
        description: '',
        title_changed: false,
        description_changed: false,
        location_changed: false
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
      start_date: date.setHours(date.getHours() + 2),
      end_date: date.setHours(date.getHours() + 1),
    }
  }

  handleFormSubmit(){
    axios.post('/api/v1/events/', {
      title: this.state.title,
      start_date: this.state.start_date,
      end_date: this.state.end_date,
      location: this.state.location,
      place: this.state.place,
      description: this.state.description
    })
    .then(function(response){
      document.location.href += `/${response.data}`
    })
  }

  handleDateUpdate(value, date){
    let date_time = new Date(date*1000)
    date_time.setFullYear(value.getFullYear())
    date_time.setMonth(value.getMonth())
    date_time.setDate(value.getDate())
    return String(date_time.getTime()/1000)
  }

  handleTimeUpdate(value, date){
    let date_time = new Date(date* 1000)
    date_time.setHours(value.getHours())
    date_time.setMinutes(value.getMinutes())
    date_time.setSeconds(0)
    date_time.setMilliseconds(0)
    return String(date_time.getTime() /1000)
  }

  setLocation(address, location){
    this.setState({place: address, location: `${location.lat()},${location.lng()}`})
  }

  titleError(){
    return this.state.title.trim().length < 5
  }
  
  startDateError(){
    const now = new Date().getTime() / 1000
    return this.state.start_date - now < 60 * 15
  }

  endDateError(){
    return this.state.end_date - this.state.start_date < 60 * 15
  }

  descriptionError(){
    return this.state.description.trim().length < 20
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
    console.log(this.formValid())
    const title_error = (this.titleError() && this.state.title_changed) ? 'It should be 5 characters' : ''
    const start_date_error = this.startDateError() ? 'Start Date and Time cannot be earlier than now' : ''
    const end_date_error = this.endDateError() ? 'End Date and Time cannot be earlier than Start Date and Time' : ''
    const description_error = (this.descriptionError() && this.state.description_changed) ? 'It should be 20 characters' : ''
    const location_error = (this.locationError() && this.state.location_changed) ? 'Select Place from a list' : ''
    return(
      <div>
        <form className="eventForm">
          <TextField
            floatingLabelText="Title*"
            errorText={title_error}
            floatingLabelFixed={false}
            value={this.state.title}
            onChange={(e)=>this.setState({title: e.target.value})}
            onBlur={()=>this.setState({title_changed: true})}
            style={{width: '100%'}}
          /><br/>
          <div className="date_time_wrapper" onBlur={this.startDateError}>
              <TimePicker
                format="24hr"
                floatingLabelText="Start Time*"
                textFieldStyle={{width: '210px', float: 'right'}}
                defaultTime={new Date(this.state.start_date * 1000)}
                onChange={(event, value, date=this.state.start_date)=>this.setState({start_date: this.handleTimeUpdate(value, date)})}
              />
              <DatePicker
                floatingLabelText="Start Date*"
                textFieldStyle={{width: '210px'}}
                defaultDate={new Date(this.state.start_date * 1000)}
                onChange={(event, value, date=this.state.end_date)=>this.setState({start_date: this.handleDateUpdate(value, date)})}
                />
              <span className="error-message">{start_date_error}</span>
          </div>
          <div className="date_time_wrapper">
              <TimePicker
                format="24hr"
                floatingLabelText="End Time*"
                defaultTime={new Date(this.state.end_date * 1000)}
                textFieldStyle={{width: '210px', float: 'right'}}
                onChange={(event, value, date=this.state.end_date)=>this.setState({end_date: this.handleTimeUpdate(value, date)})}
              />
              <DatePicker
                floatingLabelText="End Time*"
                textFieldStyle={{width: '210px'}}
                defaultDate={new Date(this.state.end_date * 1000)}
                onChange={(event, value, date=this.state.end_date)=>this.setState({end_date: this.handleDateUpdate(value, date)})}
              />
              <span className="error-message">{end_date_error}</span>
          </div>
          <TextField
            hintText="Description*"
            errorText={description_error}
            multiLine={true}
            rows={1}
            rowsMax={2}
            onInput={(e)=>this.setState({description: e.target.value})}
            onBlur={()=>this.setState({description_changed: true})}
            style={{width: '100%'}}
          /><br />
          <div>
            <input id="pac-input" 
                  className="controls" 
                  type="text" 
                  placeholder="Address" 
                  onBlur={()=>this.setState({location_changed: true})}
              />
            <Map new={true} setLocation={this.setLocation}/>
            <span className="error-message">{location_error}</span>
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
