import React from 'react';
require('jquery-countdown');
require('jquery');
import moment from 'moment';

export default class CountdownTimer extends React.Component {
    constructor(props){
        super(props);
    }

    setCountdown(timestamp) {
        let timestampDiff = new Date(new Date().getTime() + (timestamp * 1000));
        let date = moment(timestampDiff, 'YYYY/MM/D HH:MM:SS').toDate();
        var format;
        if (timestamp > 60*60*24 && timestamp < 60*60*24*2) {
            format = '%D day %H:%M:%S'
        } else if (timestamp > 60*60*24 && timestamp > 60*60*24*2) {
            format = '%D days %H:%M:%S'
        } else {
            format = '%H:%M:%S'
        }
        $('#'+this.props.id).countdown(date, function(event) {
            $(this).html(event.strftime(format));
        });
    }

    componentDidMount(){
        this.setCountdown(this.props['secondsLeft']);
    }

    render() {
        return (
            <div id={this.props.id}></div>
        )
    }
}