import React from 'react';
import axios from 'axios';
import Map from './map';
import CreateEventDialog from './EventForm';
import Comments from './comments'
import Avatar from 'material-ui/Avatar';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem} from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';
import AssignParticipants from './AssignParticipants';

let User = require('./helpers/User');

import AddVoting from './AddVoting';
import Voting from './Voting'

class Event extends React.Component{
    constructor(props){
        super(props);
        this.state = ({event: false, showConfirmationDelete: false, snackOpen: false});
        this.handleAddUsers = this.handleAddUsers.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateVotingData = this.updateVotingData.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.handleConfirmationOpen = this.handleConfirmationOpen.bind(this);
        this.handleConfirmationClose = this.handleConfirmationClose.bind(this);
        this.getEventInfo = this.getEventInfo.bind(this)
    }

    updateData (data) {
        data['is_owner'] = true;
        this.setState({
            event: data
        });
    };

    updateVotingData (votings) {
        this.refs['voting'].setState({
            votings: votings
        });
    }

    handleConfirmationOpen(event){
        event.preventDefault();
        this.setState({
        showConfirmationDelete: true,
        anchorEl: event.currentTarget,
        });
    }

    handleConfirmationClose(){
    this.setState({
      showConfirmationDelete: false,
        });
    };

    handleAddUsers(users) {
        let event = this.state.event;
        event['participants'] = this.state.event['participants'].concat(users);
        this.setState({event: event});
    };

    deleteEvent(){
        axios.delete(`api/v1/events/${this.state.event.id}`)
        .then(()=>document.location.href = `/#/`)
        .catch((response)=>console.log(response.data))
    }

    getEventInfo(){
        const url = `/api/v1/events/${this.props.params.event_id}`
        axios.get(url) 
        .then(function (response) {
            this.setState({event: response.data})
        }.bind(this))
    }

    componentWillMount(){
        this.getEventInfo()
    }

    render(){
        const startDate = new Date(this.state.event.start_date * 1000)
        const endDate = new Date(this.state.event.end_date * 1000)
        const nowDate = new Date().getTime()
        if (this.state.event){
            return(
                <MuiThemeProvider>
                <div>
                    <CreateEventDialog event={this.state.event} ref="updateEventForm" update={this.getEventInfo} showSnackBar={()=>this.setState({snackOpen: true})}/>
                <Snackbar
                    open={this.state.snackOpen}
                    message="Event was updated"
                    autoHideDuration={4000}
                    onRequestClose={()=>this.setState({snackOpen: false})}
                />
                <Popover
                    open={this.state.showConfirmationDelete}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleConfirmationClose}
                >
                <h5>Are you sure?</h5>
                <RaisedButton
                    label="Delete"
                    secondary={true}
                    buttonStyle={{backgroundColor: '#F44336'}}
                    onClick={this.deleteEvent}/>
                </Popover>
                <div className="event-card">
                    <div className="event-card-header">
                        {this.state.event.title}
                        {
                            this.state.event.is_owner || this.state.event.role == 0 ?
                            <div className="control-buttons">
                                {
                                    nowDate < this.state.event.start_date*1000 ?
                                    <a>
                                        <i
                                            className="glyphicon glyphicon-pencil"
                                            onClick={()=>this.refs.updateEventForm.handleOpen()}>
                                        </i>
                                    </a> : null
                                }
                                <a>
                                    <i
                                        className="glyphicon glyphicon-remove"
                                        onClick={this.handleConfirmationOpen} />
                                </a>
                            </div> : null
                        }
                    </div>
                    <div>
                        <Map event={true} location={this.state.event.location} geo={false} zoom={13}/>
                    </div>
                    <div className="event-card-body">
                        <div className="voting">
                            <Voting
                                ref="voting"
                                event_id={this.props.params['event_id']}
                                updateEvent={this.updateData}
                                renewVotings={this.updateVotingData}
                            />
                        </div>
                    <div>
                        <div className="col-sm-4">
                            <b>Start Date: </b> 
                            {startDate.toDateString()},
                            {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="col-sm-4">
                            <b>End Date: </b>
                            {endDate.toDateString()},
                            {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="col-sm-4">
                            <b>Place:</b> {this.state.event.place}
                        </div>
                    </div>
                    <hr/>
                    <div>
                        <b className="description-title">
                            Participants: 
                        </b>
                        <List style={{
                            maxHeight: '216px',
                            overflow: 'auto',
                        }}>
                            {this.state.event.participants.map((user, index) => {
                                return (
                                <ListItem key={index} style={{
                                    float: 'left',
                                    maxWidth: '400px',
                                }}>
                                    <Avatar
                                        style={{marginRight: 10}}
                                        size={32}
                                        backgroundColor={user['avatar']}
                                    >
                                        {user['first_name'][0].toUpperCase()}
                                    </Avatar>
                                    {User.getFullName(user)}
                                </ListItem>
                                );
                            })}
                        </List>
                    </div>                               
                    </div>
                    <div className="add-users-button">
                        { this.state.event['is_owner'] && nowDate < endDate ? (<AddVoting
                            label="add voting"
                            event_id={this.props.params['event_id']}
                            url={"/api/v1/events/"+this.props.params.event_id+"/voting/"}
                            renewVotings={this.updateVotingData}
                        />) : null}
                        { nowDate < endDate ?
                            <AssignParticipants
                                handleAddUsers={this.handleAddUsers}
                                url={"/api/v1/events/" + this.props.params.event_id + "/user_assignment/"}
                                title='Add participants'
                                hintText='Start typing participant name...'
                                noUsersText='All possible users were added to this event.'
                                snackbarMessage="successfully added to event"
                            /> : null
                        }
                    </div>
                    <div className="description-wrapper">
                        <b>
                            Description: 
                        </b>
                            {this.state.event.description}
                    </div>
                </div>
                <div className="comments-container">
                    <div className="comments-header">
                        <h1>
                            Comments
                        </h1>
                    </div><hr/>
                    <div className="comments-body">
                        <Comments event_id={this.state.event.id}/>
                    </div>
                </div>
                </div>
                </MuiThemeProvider>
            )
        }else{
            return(
                <div>
                    Event Not Found
                </div>
            )
        }
    }
}


export default Event
