const React = require('react');
const axios = require("axios");
import AssignParticipants from './AssignParticipants'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Map from './map'
import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';



class NewEvent extends React.Component{
    constructor(props){
        super(props);
        this.state = ({events: {}})
    }
    componentWillMount(){
        const url = '/api/v1/events/' + this.props.params.event_id
        axios.get(url) 
        .then(function (response) {
            const events_array = []
            events_array.push(response.data)
            this.setState({events: events_array})
        }.bind(this))
    }
    render(){
        const event = this.state.events;
        if (event[0]){
            return(
                <MuiThemeProvider>
                <div className="event-card">
                    <div className="event-card-header">
                        {this.state.events[0].title}
                    </div>
                    <div>
                        <Map events={this.state.events} geo={false} zoom={13}/>
                    </div>
                    <div className="event-card-body">
                    <div>
                        <div className="col-sm-4">
                            <b>Start Date:</b> {event[0].start_date}
                        </div>
                        <div className="col-sm-4">
                            <b>End Date:</b> {event[0].end_date}
                        </div>
                        <div className="col-sm-4">
                            <b>Place:</b> {event[0].place}
                        </div>
                    </div>
                    <hr/>
                    <div>
                        <b className="description-title">
                            Description:
                        </b>
                        {event[0].description}
                    </div>
                    <hr/>
                    <div>
                        <b className="description-title">
                            Participants: 
                        </b>
                        <List>
                            {event[0].participants.map((user) => {
                                return (
                                <ListItem>
                                    <Avatar style={{marginRight: 10}} size={32}>{user[0].toUpperCase()}</Avatar>
                                    {user}
                                </ListItem>
                                );
                            })}
                        </List>
                    </div>                        
                    </div>
                        <AssignParticipants url={"/api/v1/events/"+this.props.params.event_id+"/user_assignment/"} />

                </div>
                </MuiThemeProvider>
            )
        }else{
            return(
                <div>
                    Empty
                </div>
            )
        }
    }
}


export default NewEvent
