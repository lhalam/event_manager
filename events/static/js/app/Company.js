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
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AddCompanyWindow from './AddCompanyWindow';


export default class Company extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            company: [],
            searchTeams: [],
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
        this.newDataHandler = this.newDataHandler.bind(this);

        this.handleSearchInput = event => {
            this.setState({searchText: event.target.value.toLowerCase().trim()}, () => this.filterTeams());
        };

        this.filterTeams = () => {
            let searchTeams = [];
            this.state.company.teams.forEach(team => {
                if((team.name).toLowerCase().indexOf(this.state.searchText) != -1)
                    searchTeams.push(team);
            });
            this.setState({searchTeams: searchTeams});
        };
    }

    loadCompany() {
        axios.get('api/v1/companies/'+this.props.params.company_id)
            .then((response) => {
                console.log(response.data);
                this.setState({
                    company: response.data,
                    searchTeams: response.data.teams
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

    newDataHandler(newData) {
        let company = this.state.company;
        company['name'] = newData['name'];
        company['description'] = newData['description'];
        company['admin'] = newData['admin'];
        this.setState({
            company: company
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
            this.admin_name = companyObject['admin']['first_name']+' '+companyObject['admin']['last_name'];
            admin = (
                <List>
                    <Subheader><div className="subheader">Company Admin</div></Subheader>
                    <div className="paper-element">
                    <ListItem
                        primaryText={this.admin_name}
                        secondaryText={companyObject['admin']['username']}
                        leftAvatar={<Avatar size={32}>{companyObject['admin']['first_name'][0].toUpperCase()}</Avatar>}
                    />
                    </div>
                </List>
                );
        }

        const dialogButtons = [
            <FlatButton
                keyboardFocused={true}
                label="cancel"
                onTouchTap={this.handleDialogClose}
            />,
            <FlatButton
                secondary={true}
                label="delete"
                onTouchTap={this.deleteCompany}
            />
        ];
        if (companyObject['teams']) {
            teams = this.state.searchTeams.map((team) => {
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
                <Subheader><div className="subheader">Teams</div></Subheader>
                <div className="team-members-search">
                <TextField
                    hintText="Search"
                    onChange={this.handleSearchInput}
                />
                </div>
                <div className="members-wrap">
                    <List>
                        {teams}
                    </List>
                </div>
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
                <div className="team-members">
                    <Paper>
                        <div className="members-header">
                            {companyObject['name']}
                        </div>
                        <Subheader><div className="subheader">Description</div></Subheader>
                        <div className="paper-element">{companyObject['description']}</div>
                        {admin}
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
                            url={"api/v1/companies/"+this.props.params.company_id+'/'}
                            method="PUT"
                            open={this.state.openEdit}
                            handleCompanyClose={this.handleDialogEditClose}
                            newDataHandler={this.newDataHandler}
                            currentTitle={companyObject['name']}
                            currentDescription={companyObject['description']}
                            currentAdmin={this.admin_name}
                        />
                    </Paper>
                </div>
            </MuiThemeProvider>

        );
    }

}