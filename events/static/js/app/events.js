import Map from './map'
import CreateEventDialog from './EventForm';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import {Container, Row, Col} from 'react-grid-system';
import {Link} from 'react-router';

const React = require('react');
const axios = require("axios");


class EventList extends React.Component{
    constructor(props){
        super(props);
        this.state = ({
            events: [],
            number: 0,
            showActive: true
        });
        this.getMoreEvents = this.getMoreEvents.bind(this);
    }
    getMoreEvents(){
        const lastEventDate = this.state.events[this.state.events.length -1].start_date
        axios.get(`api/v1/events/?q=${lastEventDate}`)
        .then(function(response){
            let events = this.state.events.slice()
            events.push.apply(events, response.data)
            this.setState({events: events})
        }.bind(this))
    }
    getEventsButtonShow(){
        return this.state.events.length != this.state.number
    }
    componentWillMount(){
        axios.get('/api/v1/events/')
        .then(function (response) {
            this.setState({events: response.data.events, number: response.data.number})
        }.bind(this))
    }
    render(){
        const eventsActive =[];
        const eventsPassed = [];
        const dateNow = new Date().getTime() / 1000;
        this.state.events.map((event)=>dateNow < event.end_date ? eventsActive.push(event): eventsPassed.push(event))
        const events = this.state.showActive ? eventsActive : eventsPassed
        if (this.state.events[0]){
            return(
            <MuiThemeProvider>
            <div>
                <Map events={events} geo={true} zoom={6}/>
                <div className="event-list-wrapper">
                    {events.map(function(event){
                        return(
                                <Link key={event.id} to={`/events/${event.id}`}>
                                    <EventItem event={event}/>
                                </Link>
                        )
                    })}
                    {
                        this.getEventsButtonShow() ? 
                        <FlatButton 
                            label="Get More" 
                            primary={true}
                            onClick={this.getMoreEvents}
                        /> : null
                    }
                    <Checkbox
                        label="Active"
                        checked={this.state.showActive}
                        onClick={()=>this.setState({showActive: !this.state.showActive})}
                    />
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
        const dateStart = new Date(this.props.event.start_date * 1000)
        const dateEnd = new Date(this.props.event.end_date * 1000)
        const dateNow = new Date().getTime();
        const url = `#/events/${this.props.event.id}`
        return(
            <div className={dateNow > dateEnd ? 'event-item-wrapper passed': 'event-item-wrapper'}>
                <Col sm={3}>
                    <div className="event-title">
                        {this.props.event.title}
                    </div>
                </Col>
                <Col sm={3}>
                    <div>
                        {this.props.event.place}
                    </div>
                </Col>
                <Col sm={3}>
                    <p>
                        {this.props.event.owner.username}
                    </p>
                </Col>
                <Col sm={3}>
                    {dateStart.toDateString()}, {dateStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Col>
            </div>
        )
    }
}


export default EventList
