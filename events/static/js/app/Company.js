import React from 'react';
import axios from 'axios';
import { hashHistory } from 'react-router'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AddCompanyWindow from './AddCompanyWindow';




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

    handleBackButton() {
        setTimeout(hashHistory.push('/companies'), 500)
    }

    handleTeamClick(team_id, company_id) {
        setTimeout(hashHistory.push('/companies/'+company_id+'/teams/'+team_id), 500)
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
        let teams = null;

        if (companyObject['admin']) {
            admin = (
                <List>
                    <div className="subheader">
                        <Subheader>Company Admin</Subheader>
                    </div>
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
        if (companyObject['teams']) {
            teams = companyObject['teams'].map((team) => {
                return (
                    <ListItem
                        key={team.id}
                        primaryText={team.name}
                        onTouchTap={this.handleTeamClick.bind(this, team.id, team.company.id)}
                    />
                );

            });
        }

        const teamList = (
            <div className="team-list">
                <Subheader>Teams</Subheader>
                <List
                    style={{
                        maxHeight: '288px',
                        overflow: 'auto'
                    }}
                >

                    {teams}
                </List>
            </div>


        );

        const buttons = (
            <CardActions
            >
                <FlatButton
                    label="BACK"
                    onTouchTap={this.handleBackButton}
                />
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
                <Paper>
                    <p>
                        {companyObject['name']}
                    </p>
                    <Subheader>Description</Subheader>
                    {companyObject['description']}
                    <Divider/>
                    {admin}
                    <Divider/>
                    {teamList}
                    <Divider/>
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
                </Paper>
            </MuiThemeProvider>

        );
    }

}