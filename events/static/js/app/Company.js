import React from 'react';
import axios from 'axios';
import { hashHistory } from 'react-router'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Dialog from 'material-ui/Dialog';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AddCompanyWindow from './AddCompanyWindow';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();




export default class Company extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            company: [],
            error: '',
            open: false,
            openEdit: false

        };
        this.loadCompany = this.loadCompany.bind(this);
        this.deleteCompany = this.deleteCompany.bind(this);
        this.handleDialogOpen = this.handleDialogOpen.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);
        this.handleDialogEditOpen = this.handleDialogEditOpen.bind(this);
        this.handleDialogEditClose = this.handleDialogEditClose.bind(this);
    }

    loadCompany() {
        axios.get('api/v1/companies/'+this.props.params.company_id)
            .then((response) => {
                console.log(response.data);
                this.setState({
                    company: response.data
                });

            })
            .catch((error) => {
                console.log(error.response);
                this.setState({
                    error: error.response
                });
            });
    }

    deleteCompany() {
        this.handleDialogClose();
        axios.delete('api/v1/companies/'+this.state.company['id'])
            .then(() => {
                hashHistory.push('/companies')
            })
    }

    handleDialogOpen() {
        this.setState({
            open: true
        });
    }

    handleDialogEditOpen() {
        this.setState({
            openEdit: true
        });
    }

    handleDialogClose() {
        this.setState({
            open: false
        });
    }

    handleDialogEditClose() {
        this.setState({
            openEdit: false
        });
    }



    componentDidMount() {
        this.loadCompany()
    }

    render() {

        if (this.state.error) return <h1>{this.state.error['status']+' '+this.state.error['statusText']}</h1>;

        let companyObject = this.state.company;
        let admin = null;

        if (companyObject['admin']) {
            admin = (
                <List>
                    <Subheader>Company Admin</Subheader>
                    <ListItem
                        primaryText={companyObject['admin']['first_name']+' '+companyObject['admin']['last_name']}
                        secondaryText={companyObject['admin']['username']}
                        leftAvatar={<Avatar size={32}>{companyObject['admin']['first_name'][0].toUpperCase()}</Avatar>}
                    />
                </List>
                );
        }

        const dialogButtons = [
            <FlatButton
                keyboardFocused={true}
                primary={true}
                label="NO"
                onTouchTap={this.handleDialogClose}
            />,
            <FlatButton
                primary={true}
                label="YES"
                onTouchTap={this.deleteCompany}
            />
        ];



        const buttons = (
            <CardActions>
                <FlatButton
                    primary={true}
                    label="EDIT"
                    onTouchTap={this.handleDialogEditOpen}
                />
                <FlatButton
                    secondary={true}
                    label="Delete"
                    onTouchTap={this.handleDialogOpen}
                />
            </CardActions>
        );

        return (
            <MuiThemeProvider>
                <Card>
                    <CardTitle title={companyObject['name']}/>
                    <CardText>
                        {companyObject['description']}
                    </CardText>
                    {admin}
                    {buttons}
                    <Dialog
                        open={this.state.open}
                        actions={dialogButtons}
                    >
                        Are you sure, you want delete this company?
                    </Dialog>
                    <AddCompanyWindow
                        open={this.state.openEdit}
                    />
                </Card>
            </MuiThemeProvider>

        );
    }

}