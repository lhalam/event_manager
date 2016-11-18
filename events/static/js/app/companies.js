import React from 'react';
import axios from 'axios'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();


export default class CompaniesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companies: []
        };
        this.loadCompanies = this.loadCompanies.bind(this);
        this.deleteCompany = this.deleteCompany.bind(this);
    }

    componentDidMount () {
        this.loadCompanies()
    }

    deleteCompany(id) {
        axios.delete('api/v1/companies/'+id)
            .then(() => {
                let companies = this.state.companies.filter( (userObject) => {
                    return userObject['id'] != id
                });
                this.setState({
                    companies: companies
                });
            });
    }

    loadCompanies() {
        axios.get('api/v1/companies')
            .then((response) => {
                console.log(response.data);
                this.setState(response.data);
            })
    }

    render() {

        const style = {
            paper: {
                width: '70%',
                margin: '30px auto'
            },
            button: {
                margin: '0 30px 0 0'
            }
        };
        let companies = this.state.companies.map( (companyObject) => {
            return (
                <TableRow key={companyObject['id']}>
                    <TableRowColumn>{companyObject['id']}</TableRowColumn>
                    <TableRowColumn>{companyObject['name']}</TableRowColumn>
                    <TableRowColumn>{companyObject['admin']}</TableRowColumn>
                    <TableRowColumn>
                        <RaisedButton
                            label="Delete"
                            style={style.button}
                            secondary={true}
                            onTouchTap={this.deleteCompany.bind(this, companyObject['id'])}
                        />
                    </TableRowColumn>
                </TableRow>
            );
        });

        const TableExampleSimple = (
          <Table
              selectable={false}
          >
            <TableHeader>
              <TableRow>
                <TableHeaderColumn>ID</TableHeaderColumn>
                <TableHeaderColumn>Title</TableHeaderColumn>
                <TableHeaderColumn>Admin</TableHeaderColumn>
                <TableHeaderColumn>{}</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies}
            </TableBody>
          </Table>
        );



        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <Paper
                    zDepth={2}
                    style={style.paper}
                >
                    {TableExampleSimple}
                </Paper>
            </MuiThemeProvider>
        )
    }
}
