import React from 'react';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import CompanyTextField from './CompanyTextField';
import axios from 'axios';
export default class AddCompanyWindow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            description: '',
            admin: '',
            possible_admins: []
        };

        this.handleTitle = this.handleTitle.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
        this.handleAdmin = this.handleAdmin.bind(this);
        this.getAdminList = this.getAdminList.bind(this);
        this.sendCompanyData = this.sendCompanyData.bind(this);
    }

    handleTitle(event) {
        this.setState({
            name: event.target.value
        })
    }

    componentDidMount() {
        console.log('COMPONENT DID MOUNT');
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
                    }, () => console.log(this.state.possible_admins));
                }
            });
    }

    sendCompanyData() {
        console.log(this.state.admin, typeof (this.state.admin));
        let newCompanyData = {
            'admin': this.state.admin,
            'name': this.state.name,
            'description': this.state.description
        };
        if (this.props.method == "POST") {
            axios.post(this.props.url, newCompanyData)
                .then((response) => {
                    this.props.newDataHandler();
                    console.log(response.status, response.statusText)
                })
                .catch((error) => {
                    console.log(error.response.status, error.response.statusText)
                })
        } else if (this.props.method == "PUT") {
            axios.put(this.props.url, newCompanyData)
                .then((response) => {
                    let admin = newCompanyData['admin'];
                    let possible_admins = this.state.possible_admins;
                    newCompanyData['admin'] = possible_admins.filter((userObject) => {
                        return userObject['id'] == admin
                    })[0];
                    this.props.newDataHandler(newCompanyData);
                    console.log(response.status, response.statusText);
                })
                .catch((error) => {
                    console.log(error.response.status, error.response.statusText)
                })
        }
        this.props.handleCompanyClose();
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
        if (this.props.method == 'POST') {
            dialogTitle = 'Create company'
        } else {
            dialogTitle = 'Edit company'
        }

        const styles = {

            dialogTitle: {
                backgroundColor: 'rgb(0, 151, 167)',
                color: '#f9f9f9',
                fontSize: '30px'
            },
            dialogRoot: {
                margin: '0 auto',
                maxWidth: '500px',
                width: '100%'
            }
        };

            const standardActions = [
                <FlatButton
                    label="Cancel"
                    primary={true}
                    onTouchTap={this.props.handleCompanyClose}

                />,
                <FlatButton
                    label="Submit"
                    disabled={!this.state.admin || !this.state.name}
                    primary={true}
                    onTouchTap={this.sendCompanyData}

                />,
            ];


        return (

            <Dialog
                open={this.props.open}
                contentStyle={styles.dialogRoot}
                actions={standardActions}
                title={dialogTitle}
                titleStyle={styles.dialogTitle}
            >
                <CompanyTextField
                    value={this.props.currentTitle}
                    label='Company title'
                    ref="title"
                    onChange={this.handleTitle}
                />
                <br/>
                <CompanyTextField
                    value={this.props.currentDescription}
                    label='Company description'
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
        );
    }
}