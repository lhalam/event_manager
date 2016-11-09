import React from 'react';
import Map from './map.js'


class Event extends React.Component{
    constructor(props){
        super(props);
        this.state = ({events: {}})
    }
    componentWillMount(){
        $.get({
            url: '/api/v1/events/' + this.props.params.event_id,
        }).then(function(data){
            var ar = []
            ar.push(data)
            this.setState({events: ar})
        }.bind(this))
    }
    render(){
        if (this.state.events[0]){
            return(
                <div className="row">
                    <div className="col-sm-offset-2 col-sm-8">
                        <table className="table table-hover table-bordered">
                        <tbody>
                            <tr>
                                <td>Title</td>
                                <td>{this.state.events[0].title}</td>
                            </tr>
                            <tr>
                                <td>Start Date</td>
                                <td>{this.state.events[0].start_date}</td>
                            </tr>
                            <tr>
                                <td>End Date</td>
                                <td>{this.state.events[0].end_date}</td>
                            </tr>
                            <tr>
                                <td>Adress</td>
                                <td>{this.state.events[0].place}</td>
                            </tr>
                            <tr>
                                <td>Participants</td>
                                <td>{this.state.events[0].participants}</td>
                            </tr>
                            <tr>
                                <td>Description</td>
                                <td>{this.state.events[0].description}</td>
                            </tr>
                            <tr>
                                <td>Location</td>
                                <td><Map events={this.state.events} geo={false} zoom={13}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }else{
            return(
                <div></div>
            )
        }
    }
}


export default Event
