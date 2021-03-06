import React from 'react';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import axios from 'axios';
export default class AddCompanyWindow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            description: '',
            admin: '',
            possible_admins: [],
            open: false
        };

        this.handleTitle = this.handleTitle.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
        this.handleAdmin = this.handleAdmin.bind(this);
        this.getAdminList = this.getAdminList.bind(this);
        this.sendCompanyData = this.sendCompanyData.bind(this);
        this.newCompanyHandler = this.newCompanyHandler.bind(this);
        this.handleCompanyClose = this.handleCompanyClose.bind(this);
    }

    handleTitle(event) {
        this.setState({
            name: event.target.value
        })
    }

    newCompanyHandler() {
        this.getAdminList();
        this.setState({
            open: true,
            name: this.props.currentTitle,
            description: this.props.currentDescription,
            admin: this.props.currentAdminId,
        });
    }

    handleCompanyClose() {
        this.setState({
            open: false,
            name: '',
            description: '',
            admin: '',
        });
    }

    handleDescription(event) {
        this.setState({
            description: event.target.value
        })
    }

    handleAdmin(chosenRequest) {
        this.setState({
            admin: chosenRequest['valueKey'].toString()
        });
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

    sendCompanyData() {
        let newCompanyData = {
            'admin': this.state.admin,
            'name': this.state.name,
            'description': this.state.description
        };

        if (this.props.method == "POST") {
            axios.post(this.props.url, newCompanyData)
                .then((response) => {
                    this.props.newDataHandler(response.data['id']);
                })
                .catch((error) => {
                    alert(error.response.status+ ' ' + error.response.statusText);
                })

        } else if (this.props.method == "PUT") {
            axios.put(this.props.url, newCompanyData)
                .then(() => {
                    let admin = newCompanyData['admin'];
                    let possibleAdmins = this.state.possible_admins;
                    newCompanyData['admin'] = possibleAdmins.first((userObject) => {
                        return userObject['id'] == admin
                    });
                    this.props.newDataHandler(newCompanyData);
                })
                .catch((error) => {
                    alert(error.response.status + ' ' + error.response.statusText);
                })
        }
        this.handleCompanyClose();
    }

    render() {
        let possible_admins = this.state.possible_admins;
        const dataSource = possible_admins.map((userObject) => {
            return {
                'textKey': userObject['first_name'] + ' ' + userObject['last_name'],
                'valueKey': userObject['id']
            }
        });

        const dataSourceConfig = {
          text: 'textKey',
          value: 'valueKey',
        };

        let dialogTitle;
        let button;

        if (this.props.method == 'POST') {
            dialogTitle = 'Create company';
            button = (
                <div className="add-users-button">
                    <RaisedButton
                        label="Add new company"
                        primary={true}
                        onTouchTap={this.newCompanyHandler}
                    />
                </div>
            );
        } else {
            dialogTitle = 'Edit company';
            button = (
                <RaisedButton
                    primary={true}
                    label="EDIT"
                    onTouchTap={this.newCompanyHandler}
                />
            );
        }

            const standardActions = [
                <FlatButton
                    label="Cancel"
                    primary={true}
                    onTouchTap={this.handleCompanyClose}

                />,
                <FlatButton
                    label="Submit"
                    disabled={!this.state.admin || !this.state.name}
                    primary={true}
                    onTouchTap={this.sendCompanyData}

                />,
            ];


        return (
            <div style={{display: 'inline'}}>
                <Dialog
                    open={this.state.open}
                    actions={standardActions}
                    title={dialogTitle}
                    contentClassName={"dialog-window"}
                    titleClassName={"dialog-title"}
                >
                    <TextField
                        maxLength={50}
                        defaultValue={this.props.currentTitle}
                        floatingLabelText='Company title'
                        ref="title"
                        onChange={this.handleTitle}
                    />
                    <br/>
                    <TextField
                        maxLength={500}
                        defaultValue={this.props.currentDescription}
                        floatingLabelText='Company description'
                        ref="desc"
                        multiLine={true}
                        rows={3}
                        rowsMax={5}
                        fullWidth={true}
                        onChange={this.handleDescription}
                    /><br />
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
                {
                    this.props.disabled ? null : button
                }
            </div>
        );
    }
}