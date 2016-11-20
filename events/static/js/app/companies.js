import React from 'react';
import axios from 'axios'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import AddCompaniesWindow from './AddCompanyWindow'


export default class CompaniesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companies: []
        };
        this.loadCompanies = this.loadCompanies.bind(this);
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
        })
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
                <TableRow key={companyObject['id']}>
                    <TableRowColumn>{companyObject['id']}</TableRowColumn>
                    <TableRowColumn>{companyObject['name']}</TableRowColumn>
                    <TableRowColumn>{companyObject['admin']['username']}</TableRowColumn>
                </TableRow>
            );
        });

        const TableExampleSimple = (
          <Table
              selectable={false}
          >
            <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}
            >
              <TableRow>
                <TableHeaderColumn>ID</TableHeaderColumn>
                <TableHeaderColumn>Title</TableHeaderColumn>
                <TableHeaderColumn>Admin</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
                displayRowCheckbox={false}
                showRowHover={true}
            >
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
                    <RaisedButton
                        label="Add new company"
                        primary={true}
                        onTouchTap={this.newCompanyHandler}
                    />
                    <AddCompaniesWindow/>
                </Paper>
            </MuiThemeProvider>
        )
    }
}
