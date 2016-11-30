import Map from './map'
import CreateEventDialog from './new-event-form.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Container, Row, Col} from 'react-grid-system';
import {Link} from 'react-router';

const React = require('react');
const axios = require("axios");


class EventList extends React.Component{
    constructor(props){
        super(props);
        this.state = ({events: []})
    }
    componentWillMount(){
        axios.get('/api/v1/events/')
        .then(function (response) {
            this.setState({events: response.data})
        }.bind(this))
    }
    render(){
        if (this.state.events[0]){
            return(
            <MuiThemeProvider>
            <div>
                <Map events={this.state.events} geo={true} zoom={6}/>
                <div className="event-list-wrapper">
                    {this.state.events.map(function(event){
                        return(
                                <Link key={event.id} to={`/events/${event.id}`}>
                                    <EventItem event={event}/>
                                </Link>
                        )
                        
                    })}
                </div>
                <CreateEventDialog />
            </div>
            </MuiThemeProvider>
        )
        }else{
            return(
                <MuiThemeProvider>
                <div>
                    <CreateEventDialog />
                </div>
                </MuiThemeProvider>
            )
        }
            
    }
}


class EventItem extends React.Component{
    render(){
        const url = '#/events/' + this.props.event.id 
        return(
            <div className="event-item-wrapper">
                <Col xs={4}>
                    <div className="event-title">
                        {this.props.event.title}
                    </div>
                </Col>
                <Col xs={2}>
                    <div>
                        {this.props.event.place}
                    </div>
                </Col>
                <Col xs={3}>
                    <p>
                        {this.props.event.owner.username}
                    </p>
                </Col>
                <Col xs={3}>
                    {this.props.event.start_date}
                </Col>
            </div>
        )
    }
}


export default EventList
