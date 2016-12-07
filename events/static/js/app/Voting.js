import React from 'react';
import axios from 'axios'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import CountdownTimer from './CountdownTimer';
import moment from 'moment';
import {blue300, indigo900} from 'material-ui/styles/colors';

import ReactTooltip from 'react-tooltip'
import {findDOMNode} from 'react-dom'


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
        axios.get('api/v1/events/'+this.props['event_id']+'/voting/')
            .then((response) => {
                console.log(response.data);
                this.setState({
                    votings: response.data["votings"]
                });
            })
            .catch((error) => {
                console.log(error);
            })
    }

    makeVote(choice_id, voting_id) {
        axios.post('api/v1/events/' + this.props['event_id'] + '/voting/' + voting_id + '/choice/' + choice_id + '/vote/')
            .then((response) => {
                console.log(response.data);
                this.loadVoting();
            });

    }

    deleteVote(choice_id, voting_id) {
        axios.delete('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/vote/')
            .then((response) => {
                console.log(response.data);
                this.loadVoting();
            });

    }

    DeleteVoting(voting_id) {
        axios.delete('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id)
            .then((response) => {
                console.log(response.data);
                this.loadVoting();
            });
    }

    optionApplyHandler(event, choice_id, voting_id) {
        axios.post('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/set_data/')
            .then((response) => {
            this.loadVoting();
            console.log(response.data);
        });


    }

    handleVote(event, choice_id, voting_id, voted) {
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

    getTipContent(voters) {
        if (voters.length > 0) {
            let displayLength = 8;
            return [
                voters.slice(0, displayLength).map((voter) => {
                    return (
                            <Avatar className="tooltip-avatar" size={32}>
                                {voter['first_name'][0].toUpperCase()}
                            </Avatar>
                    )
                }),
            ]
        } else {
            return (
                null
            )
        }
    }

    getDateFormat(startDate, endDate) {
        let format = 'MMMM Do YYYY, h:mm:ss a';
        return (

            moment(startDate)
                .format(format) +
            " - " +
            moment(endDate)
                .format(format)
        );

    }

    render() {


        let votings = this.state.votings.map((voting, i) => {
            console.log(voting['seconds_left']);
            let choices = voting['choices'].sort((prev, next) => {
                if (prev['votes'] < next['votes']) return 1;
                if (prev['votes'] > next['votes']) return -1;
                if (prev['votes'] == next['.vote']) return 0;
            }).map((choice, j) => {
                let formattedChoice = this.getChoiceFormat(voting.type, choice.value);
                let chipColor = choice['voted'] ? blue300 : '#e0e0e0';
                let applyButton = (voting['seconds_left'] < 0 && voting['type'] != 'custom') ? (
                    <RaisedButton
                        className="apply-option-button"
                        label="Apply"
                        primary={true}
                        onTouchTap={this.optionApplyHandler.bind(this, event, choice.id, voting.id)}
                    />) : null;

                return [
                        <Chip
                            className="choice-item"
                            data-tip
                            data-event-off={'active' || 'focused'}
                            disabled={voting['seconds_left'] < 0}
                            ref='choiceItem'
                            data-for={choice.id}
                            backgroundColor={chipColor}
                            onTouchTap={this.handleVote.bind(this, event, choice.id, voting.id, choice['voted'])}
                            key={j}
                        >
                                <Avatar size={32} color={blue300} backgroundColor={indigo900}>
                                    {choice.votes}
                                </Avatar>
                                {formattedChoice}
                                <ReactTooltip
                                    class="tooltip"
                                    eventOff="onClick"
                                    key={choice['id'].toString()}
                                    place="right"
                                    delayShow={600}
                                    delayHide={150}
                                    id={choice['id'].toString()}
                                    effect='solid'
                                    type='info'
                                    getContent={this.getTipContent.bind(this, choice['voters'])}
                                >
                                </ReactTooltip>
                        </Chip>,
                    <div>
                        {applyButton}
                    </div>
                ];
            });

            return (
                <div key={i}>
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
                            <div className="choice-item">
                                <Subheader>Total votes: {voting['votes']}</Subheader>
                                <Subheader>You have{voting['voted'] ? "voted" : "not voted yet"}</Subheader>
                            </div>
                            {choices}
                            <div className="choice-item">
                                <p>{voting.description}</p>
                            </div>
                            <div className="add-users-button">
                                <RaisedButton
                                    className="delete-button voting-delete-button"
                                    label="Delete voting"
                                    secondary={true}
                                    onTouchTap={this.DeleteVoting.bind(this, voting.id)}
                                />
                            </div>
                        </Paper>
                    </div>
                </div>
                )

        });

        return (
            <MuiThemeProvider>
                <div>
                    {votings}
                    <ReactTooltip />
                </div>
            </MuiThemeProvider>
        );
    }
}