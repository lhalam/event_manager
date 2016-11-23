import React from 'react';
import axios from 'axios'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import AddCompaniesWindow from './AddCompanyWindow';
import {List, ListItem} from 'material-ui/List';
import { hashHistory } from 'react-router'
import TextField from 'material-ui/TextField';


export default class CompaniesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companies: [],
            searchCompanies: [],

        };
        this.loadCompanies = this.loadCompanies.bind(this);
        this.handleAdminClick = this.handleAdminClick.bind(this);
        this.newDataHandler = this.newDataHandler.bind(this);


        this.handleSearchInput = event => {
            this.setState({searchText: event.target.value.toLowerCase().trim()}, () => this.filterCompanies());
        };

        this.filterCompanies = () => {
            let searchCompanies = [];
            this.state.companies.forEach(company => {
                if((company.name).toLowerCase().indexOf(this.state.searchText) != -1)
                    searchCompanies.push(company);
            });
            this.setState({searchCompanies: searchCompanies});
        };
    }

    handleAdminClick(event) {
        event.stopPropagation();
    }

    newDataHandler() {
        this.loadCompanies()
    }


    componentDidMount () {
        this.loadCompanies()
    }

    loadCompanies() {
        axios.get('api/v1/companies')
            .then((response) => {
                console.log(response.data);
                this.setState({
                    companies: response.data.companies,
                    searchCompanies: response.data.companies,
                });
            })
    }

    handleCompanyClick(id) {
        setTimeout(hashHistory.push('/companies/' + id), 20000);
    }

    render() {

        let companies = this.state.searchCompanies.map( (companyObject) => {
            return (
                <ListItem
                    onTouchTap={this.handleCompanyClick.bind(this, companyObject['id'])}
                    key={companyObject['id']}
                    primaryText={companyObject['name']}
                >
                    <div className="outer-div">
                        <div className="inner-div">
                            <Chip
                                onTouchTap={this.handleAdminClick}
                                style={{
                                    float: 'right',
                                    margin: '-8px 0'
                                }}
                            >
                                    <Avatar size={32}>
                                        {companyObject['admin']['first_name'][0].toUpperCase()}
                                    </Avatar>
                                    {
                                        companyObject['admin']['first_name'] + ' ' +
                                        companyObject['admin']['last_name']
                                    }
                                </Chip>
                            </div>
                        </div>
                    </ListItem>
            );
        });

        const CompanyList = (
                <div className="companies-list">
                    <div className="team-members-search">
                        <TextField
                            hintText="Search"
                            onChange={this.handleSearchInput}
                        />
                    </div>
                    <div className="members-wrap">
                        <List>
                            {companies}
                        </List>
                    </div>
                </div>
        );



        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <div className="team-members">
                    <Paper
                        zDepth={2}
                    >
                        <div className="members-header">Companies</div>
                        {CompanyList}

                        <AddCompaniesWindow
                            url="api/v1/companies/"
                            method="POST"
                            newDataHandler={this.newDataHandler}
                        />
                    </Paper>
                </div>
            </MuiThemeProvider>
        )
    }
}
