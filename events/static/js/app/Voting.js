import React from 'react';
import axios from 'axios'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chip from 'material-ui/Chip';


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
        axios.get('api/v1/events/'+this.props.params.event_id+'/voting/')
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
        axios.post('api/v1/events/'+this.props.params.event_id+'/voting/'+voting_id+'/choice/'+choice_id+'/vote/')
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
        // console.log(voters, voters.length > 0);
        if (voters.length > 0) {
            console.log(voters.map((voter) => {return voter.username}).join(' '));
        }

    }

    handleVote(event, choice_id, voting_id) {
        console.log('event', event);
        event.stopPropagation();
        this.makeVote(choice_id, voting_id);
    }

    getChoiceFormat(type, choice_value) {
        let choice = JSON.parse(choice_value);
        if (type == "date") {
            return (Date(choice['start_date']) + " -- " + Date(choice['end_date']));
        } else if (type == "place") {
            return (choice['place']);
        } else {
            return (choice['value']);
        }

    }

    render() {


        let votings = this.state.votings.map((voting, i) => {
            console.log(voting.seconds_left);
            let choices = voting.choices.map((choice, i) => {
                let formated_choice = this.getChoiceFormat(voting.type, choice.value);
                return (
                    <Chip
                        onTouchTap={this.handleVote.bind(this, event, choice.id, voting.id)}
                        key={i}
                        onMouseEnter={this.handleChoiceHover.bind(this, event, choice.voters)}
                    >
                        {formated_choice}
                    </Chip>
                );
            });

            return (
                <MuiThemeProvider>
                    <div className="voting-wrap" key={i}>
                        <Paper zDepth={1}>
                            <div className="voting-header">
                                {voting.title}
                                <div className="voting-timer">{voting.seconds_left}</div>
                            </div>
                                {choices}
                            <p>{voting.description}</p>
                            <p>{voting.votes}</p>
                            <p>{voting.voted ? "voted" : "not voted"}</p>

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