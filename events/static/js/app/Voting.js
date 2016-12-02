import React from 'react';
import axios from 'axios'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chip from 'material-ui/Chip';
import CountdownTimer from './CountdownTimer';
import moment from 'moment';


export default class Voting extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            votings: []
        };

        this.loadVoting = this.loadVoting.bind(this);
    }

    componentDidMount() {
        this.loadVoting();
        console.log('Did mount');

    }

    loadVoting() {
        axios.get('api/v1/events/'+this.props.params['event_id']+'/voting/')
            .then((response) => {
                console.log(response.data);
                this.setState({
                    votings: response.data["votings"]
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    makeVote(choice_id, voting_id) {
        axios.post('api/v1/events/'+this.props.params['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/vote/')
            .then((response) => {
                alert('successfully voted');
                console.log(response.data);
                this.loadVoting();
            })
            .catch((error) => {
                this.loadVoting();
            })
    }

    deleteVote(choice_id, voting_id) {
        axios.delete('api/v1/events/'+this.props.params['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/vote/')
            .then((response) => {
                alert('successfully voted');
                console.log(response.data);
                this.loadVoting();
            })
            .catch((error) => {
                this.loadVoting();
            })
    }

    handleChoiceHover(event, voters) {
        if (voters.length > 0) {
            console.log(voters.map((voter) => {return voter.username}).join(' '));
        }

    }

    handleVote(event, choice_id, voting_id, voted) {
        console.log('event', event);
        event.stopPropagation();
        if (!voted) {
            this.makeVote(choice_id, voting_id);
        } else {
            this.deleteVote(choice_id, voting_id);
        }
    }

    getChoiceFormat(type, choice_value) {
        let choice = JSON.parse(choice_value);
        if (type == "date") {
            return (
                this.getDateFormat(
                    new Date(parseInt(choice['start_date'])*1000),
                    new Date(parseInt(choice['end_date'])*1000)
                )
            );
        } else if (type == "place") {
            return (choice['place']);
        } else {
            return (choice['value']);
        }

    }

    getDateFormat(startDate, endDate) {
        let format = 'MMMM Do YYYY, h:mm:ss a';
        return (
            'From: ' +
            moment(startDate)
                .format(format) +
            "\nTo: " +
            moment(endDate)
                .format(format)
        );

    }

    render() {


        let votings = this.state.votings.map((voting, i) => {
            console.log(voting['seconds_left']);
            let choices = voting['choices'].map((choice, j) => {
                let formattedChoice = this.getChoiceFormat(voting.type, choice.value);
                 let chipColor = choice['voted'] ? '#00bcd4' : '#e0e0e0';
                return (
                    <Chip
                        backgroundColor={chipColor}
                        onTouchTap={this.handleVote.bind(this, event, choice.id, voting.id, choice['voted'])}
                        key={j}
                        onMouseEnter={this.handleChoiceHover.bind(this, event, choice['voters'])}
                    >
                        {formattedChoice}
                    </Chip>
                );
            });

            return (
                <MuiThemeProvider key={i}>
                    <div className="voting-wrap">
                        <Paper zDepth={1}>
                            <div className="voting-header">
                                {voting.title}
                                <div className="voting-timer">
                                    <CountdownTimer
                                        id={voting.id}
                                        secondsLeft={voting['seconds_left']}
                                    />
                                </div>
                            </div>
                                {choices}
                            <p>{voting.description}</p>
                            <p>{voting['votes']}</p>
                            <p>{voting['voted'] ? "voted" : "not voted"}</p>

                        </Paper>
                    </div>
                </MuiThemeProvider>
                )

        });

        return (
            <div>
                {votings}
            </div>
        );
    }
}