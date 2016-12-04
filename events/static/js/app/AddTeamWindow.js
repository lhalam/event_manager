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

        this.handleCreateTeam = event => {
            axios.post('api/v1'+this.props.url, {name: this.state.teamName})
                .then(response => {
                    hashHistory.push(this.props.url + response.data.team_id)
                })
                .catch(error => {
                    alert(error.response.status + ' ' + error.response.statusText);
                });
        }
    }

    getAdminList()  {
        axios.get(this.props.url+'get_admin')
            .then((response) => {
                let possible_admins = this.state.possible_admins;
                if (possible_admins.length == 0) {
                    this.setState({
                        possible_admins: response.data['possible_admins']
                    });
                }
            });
    }

    render(){
        let possible_admins = this.state.possible_admins;
        const dataSource = possible_admins.map(userObject => {
            return {
                'textKey': userObject['first_name'] + ' ' + userObject['last_name'],
                'valueKey': userObject['id']
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
                label="Create"
                primary={true}
                disabled={!this.state.teamName.trim().length}
                onTouchTap={this.handleCreateTeam}
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
                        title="Create team"
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                    >
                        <TextField
                            floatingLabelText="Team name"
                            maxLength={50}
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
                            onChange={this.handleAdmin}
                            ref="admin"
                        />
                    </Dialog>
                </div>
             </MuiThemeProvider>
        );
    }
}