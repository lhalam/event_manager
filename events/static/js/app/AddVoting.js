import React from 'react';
import axios from 'axios';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { hashHistory } from 'react-router';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import DatePicker from 'material-ui/DatePicker';
import Paper from 'material-ui/Paper';
import TimePicker from 'material-ui/TimePicker';
import Map from './map';

export default class AddVoting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            title: '',
            description: '',
            start_date: this.initialDate().start_date / 1000,
            end_date: this.initialDate().end_date / 1000,
            votingEndDate: this.initialDate().end_date / 1000,
            location_changed: false,
            type: "",
            notAccessibleTypes: [],
            choices: [],
            customValue: ''
        }
        ;

        this.handleOpen = () => {this.setState({open: true});};
        this.handleClose = () => {this.setState({open: false, type: ""});};
        this.handleTitle = (event) => {this.setState({title: event.target.value})};
        this.handleDescription = (event) => {this.setState({description: event.target.value})};

        this.loadVoting = this.loadVoting.bind(this);
        this.handleRadiobuttonSelect = this.handleRadiobuttonSelect.bind(this);
        this.startDateError = this.startDateError.bind(this);
        this.endDateError = this.endDateError.bind(this);
        this.setLocation = this.setLocation.bind(this);
        this.handleDateUpdate = this.handleDateUpdate.bind(this);
        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.handleDateChoice = this.handleDateChoice.bind(this);
        this.handlePlaceChoice = this.handlePlaceChoice.bind(this);
        this.handleCustomChoice = this.handleCustomChoice.bind(this);
        this.handleCustomInput = this.handleCustomInput.bind(this);
        this.handleCreateVoting = this.handleCreateVoting.bind(this);

    }

    handleCreateVoting() {
        let newVotingData = JSON.stringify({
            "title": this.state.title,
            "description": this.state.description,
            "type": this.state.type,
            "end_date": this.state.votingEndDate,
            "choices": this.state.choices.map((choice) => {return JSON.stringify(choice)})
        });
        console.log(newVotingData);
        axios.post(this.props.url, newVotingData.toString())
                .then((response) => {
                    console.log(response.data);
                    this.loadVoting();
                })
                .catch((error) => {
                    console.log(error.response)
                })
    }

    initialDate() {
        const date = new Date();
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        return {
            start_date: date.setHours(date.getHours() + 2),
            end_date: date.setHours(date.getHours() + 1),
        }
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
        this.setState({place: address, xCoordinate: location.lat(), yCoordinate: location.lng()})
    }


    startDateError(){
        const now = new Date().getTime() / 1000
        return this.state.start_date - now < 60 * 15
    }

    endDateError(){
        return this.state.end_date - this.state.start_date < 60 * 15
    }

    endVotingDateError() {
        const now = new Date().getTime() / 1000
        return this.state.votingEndDate < now
    }

    handleRadiobuttonSelect (event) {
        this.setState({type: event.target.value, choices: []});
    }

    handleCustomInput (event) {
        this.setState({customValue: event.target.value});
    }

    handleDateChoice () {
        let choices = this.state.choices;
        choices.push({
            "start_date": this.state.start_date,
            "end_date": this.state.end_date,
        });
        this.setState({
            choices: choices,
            start_date: this.initialDate().start_date / 1000,
            end_date: this.initialDate().end_date / 1000,
        })
    }

    handlePlaceChoice () {
        let choices = this.state.choices;
        choices.push({
            "place": this.state.place,
            "x_coordinate": this.state.xCoordinate,
            "y_coordinate": this.state.yCoordinate
        });
        this.refs.mapInput.value = '';
        this.setState({
            choices: choices,
            place: '',
            location: '',
            location_changed: false
        })
    }

    handleCustomChoice() {
        let choices = this.state.choices;
        choices.push({
            "value": this.state.customValue,
        });
        this.setState({
            choices: choices,
        })
    }

    getCustomChoices () {
        let choices = this.state.choices.map((choice) => {return <p>{choice['value']}</p>});
        return ([
            <Paper>
                <TextField
                    maxLength={500}
                    floatingLabelText='Custom option'
                    multiLine={true}
                    ref="customInput"
                    rowsMax={5}
                    fullWidth={true}
                    onChange={this.handleCustomInput}
                />
            </Paper>,
             <FlatButton
                disabled={!(this.state.customValue)}
                label="Submit"
                primary={true}
                onTouchTap={this.handleCustomChoice}
            />,
            <div>
                {choices}
            </div>
        ])
    }


    getPlaceChoices () {
        const location_error = (!Boolean(this.state.xCoordinate && this.state.yCoordinate) && this.state.location_changed) ? 'Select Place from a list' : ''
        let choices = this.state.choices.map((choice) => {return <p>{choice['place']}</p>});
        return ([
                <div>
                    <input
                        id="pac-input"
                        className="controls"
                        type="text"
                        ref="mapInput"
                        placeholder="Address"
                        onBlur={()=>this.setState({location_changed: true})}
                      />
                    <Map new={true} setLocation={this.setLocation}/>
                    <span className="error-message">{location_error}</span>
                </div>,
                <FlatButton
                    disabled={location_error || !this.state.place}
                    label="Submit"
                    primary={true}
                    onTouchTap={this.handlePlaceChoice}
                />,
                <div>
                    {choices}
                </div>
        ])

    }

    getDateChoices () {
        const start_date_error = this.startDateError() ? 'Start Date and Time cannot be earlier than now (15 minutes)' : '';
        const end_date_error = this.endDateError() ? 'End Date and Time cannot be earlier than Start Date and Time (15 minutes)' : '';
        let choices = this.state.choices.map((choice) => {return <p>{choice['start_date'] + ' ' + choice['end_date']}</p>});

        return ([
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
              </div>,

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
              </div>,
            <FlatButton
                disabled={start_date_error || end_date_error}
                label="Submit"
                primary={true}
                onTouchTap={this.handleDateChoice}
            />,
            <div>
                {choices}
            </div>
        ]);

    }



    loadVoting() {
        axios.get('api/v1/events/'+this.props['event_id']+'/voting/')
            .then((response) => {
                let notAccessibleTypes = response.data['votings'].map((voting) => {return voting.type});
                this.setState({
                    notAccessibleTypes: notAccessibleTypes,
                });
            })
            .catch((error) => {
                console.log(error);
            })
    }

    componentDidMount(){
        this.loadVoting()
    }
    render(){
        const votingEndDateError = this.endVotingDateError() ? 'End date and time of voting cannot be earlier than now' : ''
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleClose}
            />,
            <FlatButton
                label="Create"
                primary={true}
                onTouchTap={this.handleCreateVoting}
                disabled={
                    this.state.choices.length == 0 ||
                    votingEndDateError ||
                    !this.state.title
                }
            />,
        ];

        let choiceBlock;

        if (this.state.type == 'custom') {
            choiceBlock = this.getCustomChoices(3)
        } else if (this.state.type == 'place') {
            choiceBlock = this.getPlaceChoices(3)
        } else if (this.state.type == 'date') {
            choiceBlock = this.getDateChoices(3)
        }

        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <div style={{display: 'inline-block'}}>
                    <RaisedButton
                        label={this.props.label}
                        onTouchTap={this.handleOpen}
                        primary={true}
                    />
                    <Dialog
                        contentClassName={"dialog-window"}
                        titleClassName={"dialog-title"}
                        bodyClassName={"voting-form-body"}
                        title="Create voting"
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                    >
                        <TextField
                            maxLength={50}
                            floatingLabelText='Voting title'
                            ref="title"
                            onChange={this.handleTitle}
                        />
                        <br/>
                        <TextField
                            maxLength={500}
                            floatingLabelText='Voting description'
                            ref="desc"
                            multiLine={true}
                            rows={3}
                            rowsMax={5}
                            fullWidth={true}
                            onChange={this.handleDescription}
                        />
                        <div className="date_time_wrapper">
                            <TimePicker
                                format="24hr"
                                floatingLabelText="End Time*"
                                defaultTime={new Date(this.state.votingEndDate * 1000)}
                                textFieldStyle={{width: '210px', float: 'right'}}
                                onChange={(event, value, date=this.state.votingEndDate)=>this.setState({votingEndDate: this.handleTimeUpdate(value, date)})}
                            />
                          <DatePicker
                                floatingLabelText="End Time*"
                                textFieldStyle={{width: '210px'}}
                                defaultDate={new Date(this.state.votingEndDate * 1000)}
                                onChange={(event, value, date=this.state.votingEndDate)=>this.setState({votingEndDate: this.handleDateUpdate(value, date)})}
                            />
                            <span className="error-message">{votingEndDateError}</span>
                        </div>,
                        <div className="radio-button-group">
                            <RadioButtonGroup
                                ref="radio"
                                name="votingType"
                                onChange={this.handleRadiobuttonSelect}
                            >
                                <RadioButton
                                    value="place"
                                    label="voting for location of event"
                                    disabled={this.state.notAccessibleTypes.indexOf('place') != -1}
                                />
                                <RadioButton
                                    value="date"
                                    label="voting for date of event"
                                    disabled={this.state.notAccessibleTypes.indexOf('date') != -1}
                                />
                                <RadioButton
                                    value="custom"
                                    label="voting for custom needs"
                                />
                            </RadioButtonGroup>
                        </div>
                        <Divider/>
                        {choiceBlock}
                    </Dialog>
                </div>
             </MuiThemeProvider>
        );
    }
}