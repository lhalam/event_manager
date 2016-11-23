import React from 'react';
import axios from 'axios';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { hashHistory } from 'react-router';

export default class CreateTeam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            teamName: ""
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
            axios.post(this.props.url, {name: this.state.teamName})
                .then(response => {
                    console.log(response);
                    //TODO: redirect
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    render(){
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
                <div>
                    <RaisedButton label="Dialog" onTouchTap={this.handleOpen} />
                    <Dialog
                        title="Create team"
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                    >
                        <TextField
                            floatingLabelText="Team name"
                            onChange={this.handleInput}
                        />
                    </Dialog>
                </div>
             </MuiThemeProvider>
        );
    }
}