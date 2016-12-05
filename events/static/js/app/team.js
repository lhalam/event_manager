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
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { hashHistory } from 'react-router';
import SearchField from './SearchField';



export default class Team extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            changedName: "",
            members: [],
            admin: null,
            searchMembers: [],
            openSnackbar: false,
            message: "",
            searchText: "",
            openDialog: false
        };
        this.handleDelete = this.handleDelete.bind(this);
        this.handleDeleteTeam = this.handleDeleteTeam.bind(this);
        this.handleRequestClose = () => this.setState({openSnackbar: false});
        this.handleAddUsers = (res) => {
            let allMembers = this.state.members.concat(res);
            this.setState({
                members: allMembers,
                searchMembers: allMembers
            });
        };

        this.handleNameEdit = event => {
            this.setState({changedName: event.target.value});
        };
        this.handleNameBlur = event => {
            let currentName = this.state.name;
            let newName = this.state.changedName;
            if(newName && newName != this.state.name)
                axios.put("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid + "/", {
                        name: newName,
                        admin:this.state.admin["id"]
                    })
                    .then(response => {
                        this.setState({
                            name: newName
                        });
                    })
                    .catch(error => {
                        this.setState({
                            changedName: currentName
                        });
                    });
            else {
                this.setState({
                    changedName: currentName
                });
            }

        };
        this.handleOpenDialog = () => {
            this.setState({openDialog: true});
        };

        this.handleCloseDialog = () => {
            this.setState({openDialog: false});
        };
    }

    componentDidMount(){
        axios.get("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid)
            .then((response) => {
                this.setState({
                    name: response.data.name,
                    changedName: response.data.name,
                    members: response.data.members,
                    searchMembers: response.data.members,
                    admin: response.data.admin
                });
            })
            .catch(error => {
                hashHistory.push("/companies/" + this.props.params.cid);
            });
    }

    handleDelete(member) {
        axios.put("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid + "/user_assignment/",
            {"member_to_del": member})
            .then((response) => {
                this.setState({
                    members: response.data['able_to_add'],
                    searchMembers: response.data['able_to_add'],
                    openSnackbar: true,
                    message: member.first_name + " " + member.last_name + " removed from the team"
                }, this.refs.searchField.filterMembers);
            })
            .catch(error => {
                alert("Something wrong happend. Please, try again.")
            });
    }

    handleDeleteTeam() {
        this.handleCloseDialog();
        axios.delete("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid)
            .then(response => {
                hashHistory.push("/companies/" + this.props.params.cid);
            })
            .catch(error => {
                alert("Something wrong happend. Please, try again.");
            });
    }

    render() {
        const actions = [
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
                onTouchTap={this.handleDeleteTeam}
            />,
        ];
        let admin = this.state.admin;
        let team_admin = null;
        if (admin) {
            team_admin = (
                <List>
                    <Subheader><div className="subheader">Team Admin</div></Subheader>
                    <div className="paper-element">
                    <ListItem
                        primaryText={admin["first_name"] + " " + admin["last_name"]}
                        secondaryText={admin['username']}
                        leftAvatar={<Avatar size={32}>{admin['first_name'][0].toUpperCase()}</Avatar>}
                    />
                    </div>
                </List>
            );
        }

        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <div>
                    <div className="team-members">
                        <Paper>
                            <div className="members-header">
                                <TextField
                                    id="team-name"
                                    value={this.state.changedName}
                                    fullWidth={true}
                                    onChange={this.handleNameEdit}
                                    maxLength={50}
                                    onBlur={this.handleNameBlur}
                                />
                            </div>
                            <Subheader><div className="subheader">Description</div></Subheader>
                            {team_admin}
                            <Subheader style={{paddingLeft: "40px"}}>Team members</Subheader>
                            <div className="team-members-search">
                                <SearchField
                                    ref="searchField"
                                    emptyListMessage="No members in team"
                                    emptySearchMessage="No members with such name"
                                    data={this.state.members}
                                    dataSearch={this.state.searchMembers}
                                    keys={["first_name", "last_name"]}
                                    handleSearch={searchMembers => this.setState({searchMembers: searchMembers}) }
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
                                                        admin["username"] != member["username"] ?
                                                        <IconButton onClick={() => this.handleDelete(member)}>
                                                            <CancelButton />
                                                        </IconButton> : null
                                                    }
                                                />
                                            );
                                        })
                                    }
                                </List>
                            </div>
                            <div className="add-users-button">
                                <RaisedButton
                                    className="delete-button"
                                    label="Delete team"
                                    secondary={true}
                                    onTouchTap={this.handleOpenDialog}
                                />
                                <AssignParticipants
                                    handleAddUsers={this.handleAddUsers}
                                    url={"/api/v1/companies/" + this.props.params.cid + "/teams/"+
                                         this.props.params.tid + "/user_assignment/"}
                                    title = 'Edit'
                                    hintText = 'Start typing participant name...'
                                    noUsersText = 'All possible users were added to this team.'
                                    snackbarMessage={"successfully added to " + this.state.name}
                                />
                                <AssignParticipants
                                    handleAddUsers={this.handleAddUsers}
                                    url={"/api/v1/companies/" + this.props.params.cid + "/teams/"+
                                         this.props.params.tid + "/user_assignment/"}
                                    title = 'Add participants'
                                    hintText = 'Start typing participant name...'
                                    noUsersText = 'All possible users were added to this team.'
                                    snackbarMessage={"successfully added to " + this.state.name}
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
                    <div>
                        <Dialog
                            actions={actions}
                            modal={true}
                            open={this.state.openDialog}
                            onRequestClose={this.handleCloseDialog}
                            contentClassName="dialog-window"
                        >
                            Are you sure you want delete the team?
                        </Dialog>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}
