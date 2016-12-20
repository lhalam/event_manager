import React from 'react'
import Countdown from './Countdown'
export default class CountdownTimer extends React.Component {

    constructor (props) {
        super(props);
    };

    render() {
        let endDate = new Date(new Date().getTime() + this.props['secondsLeft'] * 1000);

        return (
            <div className="time-left">
                <Countdown
                    endDate={endDate}
                    prefix={this.props['prefix']}
                    finalMessage={this.props['finalMessage']}
                />
            </div>
        );
    };
}