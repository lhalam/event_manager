import React from 'react';
import axios from 'axios'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Avatar from 'material-ui/Avatar';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import CountdownTimer from './CountdownTimer';
import moment from 'moment';
import {blue300, indigo900, green300} from 'material-ui/styles/colors';
import {List, ListItem} from 'material-ui/List';
import ActionDone from 'material-ui/svg-icons/action/done';

import ReactTooltip from 'react-tooltip'
import {findDOMNode} from 'react-dom'


export default class Voting extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            votings: []
        };

        this.loadVoting = this.loadVoting.bind(this);
        this.DeleteVoting = this.DeleteVoting.bind(this);
    }

    componentDidMount() {
        this.loadVoting();
        setInterval(() => {this.loadVoting()}, 5000);
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
            })
            .catch((error) => {console.log(error)});

    }

    DeleteVoting(voting_id) {
        console.log('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id);
        axios.delete('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id)
            .then((response) => {
                console.log('response', response.data);
                this.loadVoting();
            })
            .catch((error) => {
                this.loadVoting();
                console.log(error.response)
            })
    }

    optionApplyHandler(event, choice_id, voting_id) {
        axios.post('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/set_data/')
            .then((response) => {
            this.loadVoting();
            this.props.updateEvent(response.data);
            console.log('update', response.data);
            })
            .catch((error) => {
                this.loadVoting();
                console.log(error)
            });

    }

    handleVote(event, choice_id, voting, voted) {
        event.stopPropagation();
        this.loadVoting();
        console.log(voting.seconds_left+new Date().getTimezoneOffset()*60);
        if (!voted && voting['seconds_left']+new Date().getTimezoneOffset()*60 > 0) {
            this.makeVote(choice_id, voting.id);
        } else if (voting['seconds_left']+new Date().getTimezoneOffset()*60 > 0) {
            this.deleteVote(choice_id, voting.id);
        } else {
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
            console.log();
            let choices = voting['choices'].sort((prev, next) => {
                if (prev['votes'] < next['votes']) return 1;
                if (prev['votes'] > next['votes']) return -1;
                if (prev['votes'] == next['.vote']) return 0;
            }).map((choice, j) => {
                let formattedChoice = this.getChoiceFormat(voting.type, choice.value);
                let applyButton = (voting['seconds_left']+new Date().getTimezoneOffset()*60 < 0 && voting['type'] != 'custom') ? (
                    <RaisedButton
                        className="apply-option-button"
                        label="Apply"
                        primary={true}
                        onTouchTap={this.optionApplyHandler.bind(this, event, choice.id, voting.id)}
                    />) : null;
                let voted = choice['voted'] ?(<Avatar backgroundColor={green300} icon={<ActionDone />} />) : (<Avatar />);
                return [
                        <ListItem
                            className="choice-item"
                            data-tip
                            data-event-off={'active' || 'focused'}
                            disabled={voting['seconds_left']+new Date().getTimezoneOffset()*60 < 0}
                            ref='choiceItem'
                            data-for={choice.id}
                            onTouchTap={this.handleVote.bind(this, event, choice.id, voting, choice['voted'])}
                            key={j}
                            leftAvatar={voted}
                            rightAvatar={
                                <Avatar color={'#fff'} backgroundColor={'rgb(0, 151, 167)'}>
                                    {choice.votes}
                                </Avatar>
                            }
                        >
                                {formattedChoice}
                                <ReactTooltip
                                    class="tooltip"
                                    eventOff="onClick"
                                    key={choice['id'].toString()}
                                    place="top"
                                    delayShow={600}
                                    delayHide={150}
                                    id={choice['id'].toString()}
                                    effect='solid'
                                    type='info'
                                    getContent={this.getTipContent.bind(this, choice['voters'])}
                                >
                                </ReactTooltip>
                        </ListItem>,
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
                                        id={voting.id+voting.title}
                                        secondsLeft={voting['seconds_left']+new Date().getTimezoneOffset()*60}
                                    />
                                </div>
                            </div>
                            <div className="choice-item">
                                <Subheader>Total votes: {voting['votes']}</Subheader>
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