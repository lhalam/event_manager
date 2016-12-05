import React from 'react';
import axios from 'axios';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { hashHistory } from 'react-router';
import AutoComplete from 'material-ui/AutoComplete';

export default class CreateTeam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            teamName: "",
            admin: "",
            possible_admins: []
        };

        this.handleOpen = () => {
            this.setState({open: true});
        };

        this.handleClose = () => {
            this.setState({open: false});
        };

        this.handleInput = event => {
            this.setState({teamName: event.target.value})
        };

        this.handleCreateTeam = () => {
            axios.post('/api/v1/'+this.props.url, {name: this.state.teamName, admin: this.state.admin})
                .then(response => {
                    hashHistory.push(this.props.url + response.data.team_id)
                })
                .catch(error => {
                    console.log(error.response);
                    alert(error.response.status + ' ' + error.response.statusText);
                });
        };

        this.handleUpdateTeam = () => {
            axios.put('/api/v1/'+this.props.url + this.props.tid + "/", {name: this.state.teamName, admin: this.state.admin})
                .then(response => {
                    this.handleClose();
                    let admin_id = this.state.admin;
                    this.props.updateTeam(this.state.teamName,
                                          this.state.possible_admins.find(admin => admin.id == admin_id));
                })
                .catch(error => {
                    console.log(error);
                    alert(error.response.status + ' ' + error.response.statusText);
                });
        };

        this.getAdminList = this.getAdminList.bind(this);
        this.handleAdmin = this.handleAdmin.bind(this);
        this.handleAdminInput = this.handleAdminInput.bind(this);
    }

    componentDidMount() {
        if(this.props.currentTitle && this.props.currentAdminId)
            this.setState({
                teamName: this.props.currentTitle,
                admin: this.props.currentAdminId
            });
        this.getAdminList();
    }
    getAdminList()  {
        axios.get('/api/v1/'+this.props.url+'get_admin')
            .then((response) => {
                this.setState({
                    possible_admins: response.data['possible_admins']
                });
            });
    }

    handleAdmin(chosenRequest) {
        let chosen_admin = "";
        if(chosenRequest['valueKey'])
            chosen_admin = chosenRequest['valueKey'].toString();
        this.setState({
            admin: chosen_admin
        });
    }

    handleAdminInput(input_admin) {
        let possible_admin = this.state.possible_admins.find(admin => {
                    return admin.first_name + " " + admin.last_name == input_admin.trim();
                });
        if(!possible_admin)
            possible_admin = {id: ""};
        this.setState({
            admin: possible_admin.id
        });
    }

    render(){
        let possible_admins = this.state.possible_admins;
        const dataSource = possible_admins.map(user => {
            return {
                'textKey': user['first_name'] + ' ' + user['last_name'],
                'valueKey': user['id']
            }
        });

        const dataSourceConfig = {
            text: 'textKey',
            value: 'valueKey',
        };

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleClose}
            />,
            <FlatButton
                label={this.props.type == "create" ? "Create" : "Edit"}
                primary={true}
                disabled={!this.state.teamName.trim().length || !possible_admins.find(admin => {
                    return admin.id == this.state.admin;
                })}
                onTouchTap={this.props.type == "create" ? this.handleCreateTeam : this.handleUpdateTeam}
            />,
        ];

        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <div style={{display: 'inline-block'}}>
                    <RaisedButton
                        label={this.props.label}
                        onTouchTap={this.handleOpen}
                        primary={true}
                    />
                    <Dialog
                        contentClassName={"dialog-window"}
                        titleClassName={"dialog-title"}
                        title={this.props.title}
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                    >
                        <TextField
                            floatingLabelText="Team name"
                            maxLength={50}
                            defaultValue={this.props.currentTitle}
                            onChange={this.handleInput}
                        />
                        <AutoComplete
                            filter={AutoComplete.fuzzyFilter}
                            floatingLabelText="Admin"
                            dataSource={dataSource}
                            dataSourceConfig={dataSourceConfig}
                            onNewRequest={this.handleAdmin}
                            searchText={this.props.currentAdmin}
                            onFocus={this.getAdminList}
                            openOnFocus={true}
                            onUpdateInput={this.handleAdminInput}
                            ref="admin"
                            menuStyle={{maxHeight: "200px", overflow: "auto"}}
                        />
                    </Dialog>
                </div>
             </MuiThemeProvider>
        );
    }
}