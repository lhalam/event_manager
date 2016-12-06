import React from 'react';
import axios from 'axios';
import { hashHistory } from 'react-router'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AddCompanyWindow from './AddCompanyWindow';
import CreateTeam from './AddTeamWindow';
import SearchField from './SearchField';


export default class Company extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            company: [],
            teams: [],
            searchTeams: [],
            error: '',
            open: false,
            openEdit: false,
            role: 3
        };

        this.loadCompany = this.loadCompany.bind(this);
        this.newDataHandler = this.newDataHandler.bind(this);
    }

    loadCompany() {
        axios.get('api/v1/companies/'+this.props.params.company_id)
            .then((response) => {
                this.setState({
                    company: response.data,
                    searchTeams: response.data.teams,
                    teams: response.data.teams,
                    role: response.data.role
                });

            })
            .catch((error) => {
                this.setState({
                    error: error.response
                });
            });
    }


    handleTeamClick(team_id, company_id) {
        setTimeout(hashHistory.push('/companies/'+company_id+'/teams/'+team_id), 500)
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
            this.adminName = companyObject['admin']['first_name']+' '+companyObject['admin']['last_name'];
            this.adminId = companyObject['admin']['id'];
            admin = (
                <List>
                    <Subheader><div className="subheader">Company Admin</div></Subheader>
                    <div className="paper-element">
                    <ListItem
                        primaryText={this.adminName}
                        secondaryText={companyObject['admin']['username']}
                        leftAvatar={<Avatar size={32}>{companyObject['admin']['first_name'][0].toUpperCase()}</Avatar>}
                    />
                    </div>
                </List>
                );
        }

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
                    <SearchField
                        ref="searchField"
                        emptyListMessage="No teams in company"
                        emptySearchMessage="No teams with such title"
                        data={this.state.teams}
                        dataSearch={this.state.searchTeams}
                        keys={['name']}
                        handleSearch={searchMembers => this.setState({searchTeams: searchMembers}) }
                    />
                </div>
                <div className="members-wrap">
                    <List>
                        {teams}
                    </List>
                </div>
            </div>


        );
        let role = this.state.role;
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
                        <div className="button-group">
                            <CreateTeam
                                label="Add new team"
                                url={"companies/"+this.props.params.company_id+"/teams/"}
                                type="create"
                                title="Create team"
                                admin_select={this.state.role > 1}
                                disabled={this.state.role > 1}
                            />
                            <AddCompanyWindow
                                disabled={this.state.role > 1}
                                url={"api/v1/companies/"+this.props.params.company_id+'/'}
                                method="PUT"
                                newDataHandler={this.newDataHandler}
                                currentTitle={companyObject['name']}
                                currentDescription={companyObject['description']}
                                currentAdmin={this.adminName}
                                currentAdminId={this.adminId}
                            />
                        </div>
                    </Paper>
                </div>
            </MuiThemeProvider>

        );
    }

}