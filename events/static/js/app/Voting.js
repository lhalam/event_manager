import React from 'react';
import axios from 'axios'
import Paper from 'material-ui/Paper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Avatar from 'material-ui/Avatar';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import CountdownTimer from './Countdown/CountdownTimer';
import moment from 'moment';
import {blue300, indigo900, green300} from 'material-ui/styles/colors';
import {List, ListItem} from 'material-ui/List';
import ActionDone from 'material-ui/svg-icons/action/done';

import ReactTooltip from 'react-tooltip'


export default class Voting extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            votings: [],
            openDeleteDialog: false,
            votingToDelete: null,
            openSnackbar: false,
            message: null
        };

        this.loadVoting = this.loadVoting.bind(this);
        this.DeleteVoting = this.DeleteVoting.bind(this);
        this.handleCloseDialog = () => {this.setState({openDeleteDialog: false})};
        this.handleOpenDialog = (event, voting_id) => {
            this.setState({
                openDeleteDialog: true,
                votingToDelete: voting_id
            });
        };
        this.handleRequestClose = () => {this.setState({openSnackbar: false})};
    }

    componentDidMount() {
        this.loadVoting();

    }

    loadVoting() {
        axios.get('api/v1/events/'+this.props['event_id']+'/voting/')
            .then((response) => {
                this.setState({
                    votings: response.data["votings"],
                    owner: response.data["owner"]
                });
            })
            .catch((error) => {
                this.setState({
                    message: 'Error occurred. Try again later.',
                    openSnackbar: true,
                });
            })
    }

    makeVote(choice_id, voting_id) {
        axios.post('api/v1/events/' + this.props['event_id'] + '/voting/' + voting_id + '/choice/' + choice_id + '/vote/')
            .then((response) => {
                this.props.renewVotings(response.data['votings']);
            })
            .catch((error) => {
                this.setState({
                    message: 'Error occurred. '+error.response.data['error_message'],
                    openSnackbar: true,
                });
            });

    }

    deleteVote(choice_id, voting_id) {
        axios.delete('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/vote/')
            .then((response) => {
                this.setState({
                    votings: response.data["votings"],
                });
            })
            .catch((error) => {
                this.setState({
                    message: 'Error occurred. '+error.response.data['error_message'],
                    openSnackbar: true,
                });
            });

    }

    DeleteVoting() {
        this.handleCloseDialog();
        axios.delete('api/v1/events/'+this.props['event_id']+'/voting/'+this.state.votingToDelete)
            .then((response) => {
                this.setState({
                    votings: response.data["votings"],
                    votingToDelete: null,
                    message: 'Voting successfully deleted',
                    openSnackbar: true,
                });
            })
            .catch((error) => {
                this.setState({
                    message: 'Error occurred. '+error.response.data['error_message'],
                    openSnackbar: true,
                });
            });
    }

    optionApplyHandler(event, choice_id, voting_id) {
        axios.post('api/v1/events/'+this.props['event_id']+'/voting/'+voting_id+'/choice/'+choice_id+'/set_data/')
            .then((response) => {
            this.props.updateEvent(response.data['event']);
            this.props.renewVotings(response.data['votings']);
            })
            .catch((error) => {
                this.setState({
                    message: 'Error occurred. '+error.response.data['error_message'],
                    openSnackbar: true,
                });
            });
    }

    handleVote(event, choice_id, voting, voted) {
        event.stopPropagation();
        this.loadVoting();
        if (!voted && voting['seconds_left'] > 0) {
            this.makeVote(choice_id, voting.id);
        } else if (voting['seconds_left'] > 0) {
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
            let displayLength = 6;
            let users = [
                voters.slice(0, displayLength).map((voter) => {
                    return (
                            <Avatar
                                key={voter['id']}
                                className="tooltip-avatar"
                                onTouchTap={this.handleTipAvatarClick.bind(this, voter)}
                            >
                                {voter['first_name'][0].toUpperCase()}
                            </Avatar>
                    )
                })
            ];
            return (
                <div>
                    <p key={voters[0]['id']} className="voting-tip-header">{`${voters.length} people voted`}</p>
                    {users}
                </div>
            )

        } return null
    }

    handleTipAvatarClick(voter, event) {
        event.stopPropagation();
        alert(voter['first_name']);
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
            let choices = voting['choices'].sort((prev, next) => {
                if (prev['votes'] < next['votes']) return 1;
                if (prev['votes'] > next['votes']) return -1;
                if (prev['votes'] == next['.vote']) return 0;
            }).map((choice, j) => {
                let formattedChoice = this.getChoiceFormat(voting.type, choice.value);
                let applyButton = (
                    voting['seconds_left'] < 0
                    && voting['type'] != 'custom'
                    && this.state.owner) ? (
                    <RaisedButton
                        className="apply-option-button"
                        label="Apply"
                        primary={true}
                        onTouchTap={this.optionApplyHandler.bind(this, event, choice.id, voting.id)}
                    />) : null;
                let voted = choice['voted'] ?(<Avatar backgroundColor={green300} icon={<ActionDone />} />) : (<Avatar />);
                return [
                    <div>
                        <ListItem
                            className="choice-item voting-option"
                            data-tip
                            data-event-off={'active' || 'focused'}
                            disabled={voting['seconds_left'] < 0 || voting['voted']}
                            ref='choiceItem'
                            data-for={choice.id}
                            onTouchTap={this.handleVote.bind(this, event, choice.id, voting, choice['voted'])}
                            key={j}
                            leftAvatar={voted}
                            rightAvatar={
                                <Avatar color={'#fff'} backgroundColor={'rgb(0, 151, 167)'}>
                                    {choice['votes']}
                                </Avatar>
                            }
                        >
                            <ReactTooltip
                                class="tooltip"
                                eventOff="onClick"
                                key={j}
                                place="top"
                                delayShow={700}
                                delayHide={900}
                                id={choice['id'].toString()}
                                effect='solid'
                                getContent={[this.getTipContent.bind(this, choice['voters']), 150]}
                            >
                            </ReactTooltip>
                            {formattedChoice}
                        </ListItem>
                    </div>,
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
                            </div>
                            <div className="choice-item">
                                <p>{voting.description}</p>
                            </div>
                            <div className="choice-item">
                                <div className="time-left">Total votes: {voting['votes']}</div>
                                <div className='time-left'>
                                    <CountdownTimer
                                        secondsLeft={voting['seconds_left']}
                                        prefix="Time left"
                                        finalMessage="Time for voting passed"
                                    />
                                </div>
                            </div>
                            {choices}
                            <div className="add-users-button">
                                {
                                    this.state.owner ? (

                                            <RaisedButton
                                                className="delete-button voting-delete-button"
                                                label="Delete voting"
                                                secondary={true}
                                                onTouchTap={this.handleOpenDialog.bind(this, event, voting.id)}
                                            />
                                    ) : null
                                }
                                {
                                    (voting['voted'] && voting['seconds_left'] > 0) ? (
                                            <RaisedButton
                                                className="voting-delete-button"
                                                label="Revote"
                                                disabled={voting['seconds_left'] < 0}
                                                primary={true}
                                                onTouchTap={this.handleVote.bind(this, event, voting['voted_choice'].id, voting, true)}
                                            />

                                    ) : null
                                }
                            </div>
                        </Paper>
                    </div>
                    <Dialog
                        actions={
                            [
                                <FlatButton
                                    label="Cancel"
                                    primary={true}
                                    onTouchTap={this.handleCloseDialog}
                                />,
                                <RaisedButton
                                    className="delete-button"
                                    label="Delete"
                                    primary={true}
                                    style={{backgroundColor: "#f44336", color: "white", marginLeft: "10px"}}
                                    onTouchTap={this.DeleteVoting}
                                />,
                            ]
                        }
                        modal={true}
                        open={this.state.openDeleteDialog}
                        onRequestClose={this.handleCloseDialog}
                        contentClassName="dialog-window"
                    >
                        Are you sure you want delete the voting?
                    </Dialog>
                </div>
            );
        });

        return (
            <MuiThemeProvider>
                <div>
                    {votings}
                    <ReactTooltip />
                    <Snackbar
                        open={this.state.openSnackbar}
                        message={this.state.message}
                        autoHideDuration={3000}
                        onRequestClose={this.handleRequestClose}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}
