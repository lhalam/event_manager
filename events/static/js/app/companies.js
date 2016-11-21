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


export default class CompaniesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companies: [],
            open: false
        };
        this.loadCompanies = this.loadCompanies.bind(this);
        this.newCompanyHandler = this.newCompanyHandler.bind(this);
    }

    componentDidMount () {
        this.loadCompanies()
    }

    loadCompanies() {
        axios.get('api/v1/companies')
            .then((response) => {
                console.log(response.data);
                this.setState(response.data);
            })
    }

    newCompanyHandler() {
        this.setState({
            open: true
        });
    }

    handleCompanyClick(id) {
        hashHistory.push('/companies/'+id);
    }

    render() {
        const style = {
            paper: {
                width: '70%',
                margin: '30px auto'
            },
            button: {
                margin: '0 auto',
            }
        };
        let companies = this.state.companies.map( (companyObject) => {
            return (
                <ListItem
                    onTouchTap={this.handleCompanyClick.bind(this, companyObject['id'])}
                    key={companyObject['id']}
                    primaryText={companyObject['name']}
                >
                    <Chip
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
                    </ListItem>
            );
        });

        const CompanyList = (
          <List
          >
              {companies}
          </List>
        );



        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <Paper
                    zDepth={2}
                    style={style.paper}
                >
                    {CompanyList}
                    <RaisedButton
                        label="Add new company"
                        primary={true}
                        onTouchTap={this.newCompanyHandler}
                    />
                    <AddCompaniesWindow
                        open={this.state.open}
                    />
                </Paper>
            </MuiThemeProvider>
        )
    }
}
