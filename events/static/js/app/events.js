import React from 'react'
import Map from './map.js'

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
        .catch(function (error) {
            console.log(error);
  });
    }
    componentDidMount(){
        
    }
    render(){
        if (this.state.events[0]){
            return(
            <div>
                <Map events={this.state.events} geo={true} zoom={6}/>
                <div>
                    {this.state.events.map(function(event){
                        return <EventItem key={event.id} id={event.id} title={event.title}/>
                    })}
                </div>
            </div>
        )
        }else{
            return(
                <div>
                </div>
            )
        }
            
    }
}

class EventItem extends React.Component{
    render(){
        var url =  '#/events/' + this.props.id
        return (
            <div>
                <a href={url}>{this.props.title}</a>
            </div>
        )
    }
}

export default EventList
