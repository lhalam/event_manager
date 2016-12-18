import React from 'react';
import axios from 'axios';
import Map from './map';
import Comments from './comments'
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AssignParticipants from './AssignParticipants';
import AddVoting from './AddVoting';
import Voting from './Voting'

class Event extends React.Component{
    constructor(props){
        super(props);
        this.state = ({event: false});
        this.handleAddUsers = this.handleAddUsers.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateVotingData = this.updateVotingData.bind(this);
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

    handleAddUsers(users) {
        let event = this.state.event;
        let allUsers = this.state.event['participants'].slice();
        allUsers.push.apply(allUsers, users.map((userObj) => userObj['username']));
        event['participants'] = allUsers;
        this.setState({event: event});
    };

    componentDidMount(){
        const url = '/api/v1/events/' + this.props.params.event_id
        axios.get(url) 
        .then(function (response) {
            this.setState({event: response.data})
        }.bind(this))
    }

    render(){
        const start_date = new Date(this.state.event.start_date * 1000)
        const end_date = new Date(this.state.event.end_date * 1000)
        if (this.state.event){
            return(
                <MuiThemeProvider>
                <div>
                <div className="event-card">
                    <div className="event-card-header">
                        {this.state.event.title}
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
                            {start_date.toDateString()},
                            {start_date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="col-sm-4">
                            <b>End Date: </b>
                            {end_date.toDateString()},
                            {end_date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
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
                                    <Avatar style={{marginRight: 10}} 
                                            size={32}>{user[0].toUpperCase()}
                                    </Avatar>
                                    {user}
                                </ListItem>
                                );
                            })}
                        </List>
                    </div>                               
                    </div>
                    <div className="add-users-button">
                        { this.state.event['is_owner'] ? (<AddVoting
                            label="add voting"
                            event_id={this.props.params['event_id']}
                            url={"/api/v1/events/"+this.props.params.event_id+"/voting/"}
                            renewVotings={this.updateVotingData}
                        />) : null}
                        <AssignParticipants
                            handleAddUsers={this.handleAddUsers}
                            url={"/api/v1/events/"+this.props.params.event_id+"/user_assignment/"}
                            title='Add participants'
                            hintText='Start typing participant name...'
                            noUsersText='All possible users were added to this event.'
                            snackbarMessage="successfully added to event"
                        />
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
