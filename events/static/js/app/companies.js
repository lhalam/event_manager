import React from 'react';
import axios from 'axios'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import AddCompaniesWindow from './AddCompanyWindow';
import {List, ListItem} from 'material-ui/List';
import { hashHistory } from 'react-router'
import SearchField from './SearchField';

let User = require('./helpers/User');

export default class CompaniesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companies: [],
            searchCompanies: [],
            role: 3,

        };

        this.loadCompanies = this.loadCompanies.bind(this);
        this.handleAdminClick = this.handleAdminClick.bind(this);
        this.newDataHandler = this.newDataHandler.bind(this);

    }

    handleAdminClick(event) {
        event.stopPropagation();
    }

    newDataHandler(company_id) {
        hashHistory.push('/companies/'+company_id)
    }


    componentDidMount () {
        this.loadCompanies()
    }

    loadCompanies() {
        axios.get('api/v1/companies')
            .then((response) => {
                this.setState({
                    companies: response.data.companies,
                    searchCompanies: response.data.companies,
                    role: response.data.role,
                });
            })
    }

    handleCompanyClick(id) {
        hashHistory.push('/companies/' + id);
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
                                    <Avatar
                                        size={32}
                                        backgroundColor={companyObject['admin']['avatar']}
                                    >
                                        {companyObject['admin']['first_name'][0].toUpperCase()}
                                    </Avatar>
                                    {User.getFullName(companyObject['admin'])}
                                </Chip>
                            </div>
                        </div>
                    </ListItem>
            );
        });

        const CompanyList = (
                <div className="companies-list">
                    <div className="team-members-search">
                        <SearchField
                        ref="searchField"
                        emptyListMessage="No companies"
                        emptySearchMessage="No companies with such title"
                        data={this.state.companies}
                        dataSearch={this.state.searchCompanies}
                        keys={['name']}
                        handleSearch={searchMembers => this.setState({searchCompanies: searchMembers}) }
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
                        {
                            this.state.role < 1 ? (
                                < AddCompaniesWindow
                                url="api/v1/companies/"
                                method="POST"
                                newDataHandler={this.newDataHandler}
                                />
                            ): null
                        }
                    </Paper>
                </div>
            </MuiThemeProvider>
        )
    }
}
