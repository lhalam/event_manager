import React from 'react'

export default class Countdown extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
        remaining: null
    }
  }

  componentDidMount() {
    this.tick();
    this.interval = setInterval(this.tick.bind(this), 200)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  tick() {
    let startDate = new Date();
    let endDate = this.props['endDate'];
    let remaining = this.dateBetween(startDate, endDate);
    this.setState({remaining: remaining })
  }

  dateBetween(startDate, endDate) {
  let second = 1000;
  let minute = second * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let distance = endDate - startDate;
  if (distance < 0) return this.props['finalMessage'];

  let days = Math.floor(distance / day);
  let hours = Math.floor((distance % day) / hour);
  let minutes = Math.floor((distance % hour) / minute);
  let seconds = Math.floor((distance % minute) / second);

  var day_description = days == 1 ? ' day ' : ' days ';
  var between = days > 0 ? days + day_description : '';

  between += `${('00'+hours).slice(-2)}:`;
  between += `${('00'+minutes).slice(-2)}:`;
  between += ('00'+seconds).slice(-2);

  return `${this.props['prefix']}: ${between}`;
}


  render() {
    return (
      <div className="time-left">
        {this.state.remaining}
      </div>
    )
  };
}
