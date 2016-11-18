import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import axios from 'axios';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import CancelButton from 'material-ui/svg-icons/navigation/cancel';
import Snackbar from 'material-ui/Snackbar';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

export default class Team extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            company: "",
            members: [],
            openSnackbar: false,
            message: ""
        };
        this.handleDelete = this.handleDelete.bind(this);
        this.handleRequestClose = () => this.setState({openSnackbar: false})
    }

    componentDidMount(){
        axios.get("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid)
            .then((response) => {
                this.setState(response.data);
            });
    }

    handleDelete(member) {
        axios.put("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid + "/user_assignment/",
            {"member_to_del": member})
            .then((response) => {
                this.setState({
                    members: response.data['members_to_del'],
                    openSnackbar: true,
                    message: member.first_name + " " + member.last_name + " removed from the team"
                });
            });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
            <div>
                <h1>{this.state.name}</h1>
                <h2>{this.state.company}</h2>
                    <div className="team-members">
                        <Paper>
                            <p className="members-header">Team members</p>
                            <div className="members-wrap">
                                <List>
                                    {
                                        this.state.members.map((member, index) => {
                                            return (
                                                <ListItem
                                                    key={index}
                                                    primaryText={member.first_name + " " + member.last_name}
                                                    leftAvatar={<Avatar>{member.first_name[0]}</Avatar>}
                                                    rightIconButton={
                                                        <IconButton onClick={() => this.handleDelete(member)}>
                                                            <CancelButton />
                                                        </IconButton>
                                                    }
                                                />
                                            );
                                        })
                                    }
                                </List>
                            </div>
                        </Paper>
                    </div>
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
