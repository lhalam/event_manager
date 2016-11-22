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
import AssignParticipants from './AssignParticipants';
import TextField from 'material-ui/TextField';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

export default class Team extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            members: [],
            searchMembers: [],
            openSnackbar: false,
            message: "",
            searchText: ""
        };
        this.handleDelete = this.handleDelete.bind(this);
        this.handleRequestClose = () => this.setState({openSnackbar: false});
        this.handleAddUsers = (res) => {
            let allMembers = this.state.members.concat(res);
            this.setState({members: allMembers});
        };
        this.filterMembers = () => {
            let searchMembers = [];
            this.state.members.forEach(user => {
                if(user.first_name.toLowerCase().startsWith(this.state.searchText) ||
                   user.last_name.toLowerCase().startsWith(this.state.searchText) ||
                    (user.first_name + " " + user.last_name).toLowerCase().startsWith(this.state.searchText))
                    searchMembers.push(user);
            });
            this.setState({searchMembers: searchMembers});
        };
        this.handleSearchInput = event => {
            this.setState({searchText: event.target.value.toLowerCase().trim()}, () => this.filterMembers());
        }
    }

    componentDidMount(){
        axios.get("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid)
            .then((response) => {
                this.setState({
                    "name": response.data.name,
                    "members": response.data.members,
                    "searchMembers": response.data.members
                });
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
                }, () => this.filterMembers());
            });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <div>
                    <h1>{this.state.name}</h1>
                    <div className="team-members">
                        <Paper>
                            <p className="members-header">Team members</p>
                            <div className="team-members-search">
                                <TextField
                                    hintText="Search"
                                    onChange={this.handleSearchInput}
                                />
                            </div>
                            <div className="members-wrap">
                                <List>
                                    {
                                        this.state.searchMembers.map((member, index) => {
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
                            <div className="add-users-button">
                                <AssignParticipants
                                    handleAddUsers={this.handleAddUsers}
                                    url="/api/v1/companies/2/teams/5/user_assignment/"
                                    title = 'Add participants'
                                    hintText = 'Start typing participant name...'
                                    noUsersText = 'All possible users were added to this team.'
                                />
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
